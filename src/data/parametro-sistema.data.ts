import { ParametroSistema } from "@/types/parametro-sistema";



export const MOCK_PARAMETROS: ParametroSistema[] = [
  {
    idParametroSistema: 1,
    nombreParametroSistema: "TIMEOUT_SESSION",
    valorParametroSistema: "3600",
    idGrupoParametro: 1,
    idEntidadSistema: 1,
    indicadorEstado: "A",
    usuarioRegistro: "admin",
    fechaRegistro: "2024-01-15T10:30:00",
    usuarioModificacion: "admin",
    fechaModificacion: "2024-01-20T14:45:00",
    estadoSincronizacion: "S",
  },
  {
    idParametroSistema: 2,
    nombreParametroSistema: "MAX_INTENTOS_LOGIN",
    valorParametroSistema: "5",
    idGrupoParametro: 2,
    idEntidadSistema: 1,
    indicadorEstado: "A",
    usuarioRegistro: "admin",
    fechaRegistro: "2024-01-16T09:15:00",
    usuarioModificacion: undefined,
    fechaModificacion: undefined,
    estadoSincronizacion: "P",
  },
  {
    idParametroSistema: 3,
    nombreParametroSistema: "RUTA_BACKUP",
    valorParametroSistema: "/var/backups/sistema",
    idGrupoParametro: undefined,
    idEntidadSistema: 2,
    indicadorEstado: "A",
    usuarioRegistro: "jperez",
    fechaRegistro: "2024-01-18T16:20:00",
    usuarioModificacion: "admin",
    fechaModificacion: "2024-01-22T11:30:00",
    estadoSincronizacion: "S",
  },
  {
    idParametroSistema: 4,
    nombreParametroSistema: "ENVIO_EMAIL_AUTOMATICO",
    valorParametroSistema: "true",
    idGrupoParametro: 3,
    idEntidadSistema: 1,
    indicadorEstado: "I",
    usuarioRegistro: "mlopez",
    fechaRegistro: "2024-01-10T08:00:00",
    usuarioModificacion: "admin",
    fechaModificacion: "2024-01-25T13:15:00",
    estadoSincronizacion: "P",
  },
];


export const RUC_MOCK = [
  {
      Ruc: 20201234567,
      parametroSistemaData: MOCK_PARAMETROS
  },
  {
      Ruc: 20201234568,
      parametroSistemaData: MOCK_PARAMETROS
  },
  {      
      Ruc: 20201234569,
      parametroSistemaData: MOCK_PARAMETROS
  }
];
