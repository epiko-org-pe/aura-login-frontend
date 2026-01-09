import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, CheckCircle2, Building2, AlertCircle } from 'lucide-react';

const RUC_STORAGE_KEY = 'remembered_ruc';
const CURRENT_RUC_KEY = 'current_ruc';
const COMPANY_LOGO_KEY = 'company_logos';
const API_BASE_URL = 'http://localhost:3001/api';
const TARGET_APP_URL = 'http://localhost:3000';

// Helper to get initials from RUC
const getCompanyInitials = (ruc: string): string => {
  return ruc.slice(0, 2).toUpperCase();
};

// Component for company logo/initials
const CompanyAvatar = ({ ruc, logoUrl }: { ruc: string; logoUrl?: string }) => {
  const initials = getCompanyInitials(ruc);
  
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="Logo empresa"
        className="h-5 w-5 rounded-full object-cover"
      />
    );
  }
  
  return (
    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
      <span className="text-[10px] font-semibold text-primary-foreground">
        {initials}
      </span>
    </div>
  );
};

const authSchema = z.object({
  ruc: z.string()
    .trim()
    .min(11, { message: "El RUC debe tener 11 dígitos" })
    .max(11, { message: "El RUC debe tener 11 dígitos" })
    .regex(/^\d+$/, { message: "El RUC solo debe contener números" }),
});

const Auth = () => {
  const [ruc, setRuc] = useState('');
  const [rememberRuc, setRememberRuc] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ ruc?: string }>({});
  const [availableRucs, setAvailableRucs] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Load remembered RUC
  useEffect(() => {
    const savedRuc = localStorage.getItem(RUC_STORAGE_KEY);
    if (savedRuc) {
      setRuc(savedRuc);
      setRememberRuc(true);
      // Load cached logo for this RUC
      const logos = JSON.parse(localStorage.getItem(COMPANY_LOGO_KEY) || '{}');
      if (logos[savedRuc]) {
        setCompanyLogo(logos[savedRuc]);
      }
    }
  }, []);

  const validateForm = () => {
    const result = authSchema.safeParse({ ruc });
    if (!result.success) {
      const fieldErrors: { ruc?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'ruc') fieldErrors.ruc = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateRucWithAPI = async (rucValue: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/parametros-sistema`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ruc': rucValue,
        },
      });

      if (response.ok) {
        return true;
      }

      if (response.status === 400) {
        const errorData = await response.json();
        
        // Extraer RUCs permitidos del mensaje de error
        const match = errorData.message?.match(/RUCs permitidos: ([\d, ]+)/);
        if (match) {
          const rucsPermitidos = match[1].split(', ').map((r: string) => r.trim());
          setAvailableRucs(rucsPermitidos);
        }

        setErrors({ ruc: 'RUC no encontrado en el sistema' });
        toast({
          title: "RUC no válido",
          description: errorData.message || "El RUC ingresado no está registrado en el sistema.",
          variant: "destructive",
        });
        return false;
      }

      throw new Error('Error en la validación del RUC');
    } catch (error) {
      console.error('Error validando RUC:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica que la API esté corriendo en el puerto 3001.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setAvailableRucs([]);

    // Validar RUC contra la API
    const isValid = await validateRucWithAPI(ruc);

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    // RUC válido, guardar en localStorage
    localStorage.setItem(CURRENT_RUC_KEY, ruc);

    // Handle RUC remember preference
    if (rememberRuc) {
      localStorage.setItem(RUC_STORAGE_KEY, ruc);
    } else {
      localStorage.removeItem(RUC_STORAGE_KEY);
    }

    toast({
      title: "¡Bienvenido!",
      description: "RUC validado correctamente. Redirigiendo...",
    });

    // Redirigir a localhost:3000 con el RUC en la URL
    setTimeout(() => {
      window.location.href = `${TARGET_APP_URL}?ruc=${ruc}`;
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl font-display font-semibold mb-6">
              Bienvenido
            </h1>
            <p className="text-xl opacity-90 max-w-md leading-relaxed">
              Accede a tu cuenta para explorar todas las funcionalidades de nuestra plataforma.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 space-y-4"
          >
            {['Seguridad avanzada', 'Experiencia fluida', 'Soporte 24/7'].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-lg opacity-90">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5" />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Platform Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg"
            >
              <span className="text-2xl font-bold text-primary-foreground">LP</span>
            </motion.div>
          </div>

          {/* Mobile header */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-display font-semibold text-foreground mb-2">
              Bienvenido
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión con tu RUC
            </p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-muted-foreground">
              Ingresa tu RUC para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ruc" className="text-sm font-medium text-foreground">
                RUC
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    {ruc.length === 11 ? (
                      <motion.div
                        key="avatar"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CompanyAvatar ruc={ruc} logoUrl={companyLogo} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Input
                  id="ruc"
                  type="text"
                  placeholder="10004438804"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="pl-12"
                  disabled={isLoading}
                  maxLength={11}
                />
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="rememberRuc"
                  checked={rememberRuc}
                  onCheckedChange={(checked) => setRememberRuc(checked === true)}
                />
                <Label htmlFor="rememberRuc" className="text-sm text-muted-foreground cursor-pointer">
                  Recordar RUC
                </Label>
              </div>
              <AnimatePresence>
                {errors.ruc && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.ruc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              variant="elegant"
              size="lg"
              className="w-full group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* RUCs disponibles */}
          <AnimatePresence>
            {availableRucs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                      RUCs disponibles:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableRucs.map((availableRuc) => (
                        <button
                          key={availableRuc}
                          type="button"
                          onClick={() => setRuc(availableRuc)}
                          className="px-3 py-1 text-xs font-mono bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          {availableRuc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info de la API */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Validando contra: <span className="font-mono">{API_BASE_URL}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;