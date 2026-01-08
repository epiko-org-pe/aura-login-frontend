import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, Building2 } from 'lucide-react';

const RUC_STORAGE_KEY = 'remembered_ruc';
const COMPANY_LOGO_KEY = 'company_logos'; // Cache for company logos

// Helper to get initials from RUC (first 2 digits for now, could be company name later)
const getCompanyInitials = (ruc: string): string => {
  // You can customize this - for now uses first 2 chars
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
  ruc: z.string().trim().min(11, { message: "El RUC debe tener 11 dígitos" }).max(11, { message: "El RUC debe tener 11 dígitos" }).regex(/^\d+$/, { message: "El RUC solo debe contener números" }),
  email: z.string().trim().email({ message: "Ingresa un email válido" }).max(255),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [ruc, setRuc] = useState('');
  const [rememberRuc, setRememberRuc] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ ruc?: string; email?: string; password?: string }>({});
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load remembered RUC and logo from localStorage
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

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const result = authSchema.safeParse({ ruc, email, password });
    if (!result.success) {
      const fieldErrors: { ruc?: string; email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'ruc') fieldErrors.ruc = err.message;
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    // Handle RUC remember preference
    if (rememberRuc) {
      localStorage.setItem(RUC_STORAGE_KEY, ruc);
    } else {
      localStorage.removeItem(RUC_STORAGE_KEY);
    }

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        let message = error.message;
        if (error.message.includes('Invalid login credentials')) {
          message = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.message.includes('User already registered')) {
          message = 'Este email ya está registrado. Intenta iniciar sesión.';
        }
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } else if (!isLogin) {
        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {['Seguridad avanzada', 'Experiencia fluida', 'Soporte 24/7'].map((feature, index) => (
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
              {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
            </p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Ingresa tus credenciales para continuar' 
                : 'Completa tus datos para registrarte'}
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
                  placeholder="20123456789"
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
                    className="text-sm text-destructive"
                  >
                    {errors.ruc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-destructive"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-destructive"
                  >
                    {errors.password}
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
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="ml-2 text-primary hover:text-primary-hover font-medium transition-colors"
              >
                {isLogin ? 'Regístrate' : 'Inicia Sesión'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
