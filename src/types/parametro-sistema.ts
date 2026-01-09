export interface ParametroSistema {
    idParametroSistema: number;
    nombreParametroSistema: string;
    valorParametroSistema: string;
    idGrupoParametro?: number;
    idEntidadSistema: number;
    indicadorEstado: string;
    usuarioRegistro: string;
    fechaRegistro: string;
    usuarioModificacion?: string;
    fechaModificacion?: string;
    estadoSincronizacion: string;
}


export interface CreateParametroSistemaDto {
  nombreParametroSistema: string;
  valorParametroSistema: string;
  idGrupoParametro?: number;
  idEntidadSistema: number;
  indicadorEstado?: 'A' | 'I'; //default es A en la db
  usuarioRegistro: string;
}



export interface UpdateParametroSistemaDto {
  nombreParametroSistema?: string;
  valorParametroSistema?: string;
  idGrupoParametro?: number | null;
  indicadorEstado?: 'A' | 'I';
  usuarioModificacion: string;
}
