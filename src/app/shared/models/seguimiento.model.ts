export type PublicoSeguimiento = 'EGRESADO' | 'EMPLEADOR' | 'SIN_CLASIFICAR';
export type EstadoSeguimiento = 'COMPLETO' | 'PENDIENTE' | 'SIN_ENVIOS' | 'NO_APLICA';

export interface EncuestaSeguimiento {
  idEncuesta: number;
  nombre: string;
  respondida: boolean;
  ultimaRespuesta: string | null;
}

export interface PersonaSeguimiento {
  idUsuario: number;
  documento: string;
  nombre: string;
  publico: PublicoSeguimiento;
  facultad: string | null;
  escuelaProfesional: string | null;
  cohorte: string | null;
  aplicables: number;
  respondidas: number;
  pendientes: number;
  porcentaje: number | null;
  estado: EstadoSeguimiento;
  ultimaRespuesta: string | null;
  encuestas: EncuestaSeguimiento[];
}

export type PersonaResumenSeguimiento = Omit<
  PersonaSeguimiento,
  'estado' | 'ultimaRespuesta' | 'encuestas'
>;

export interface ResumenSeguimiento {
  registrados: number;
  egresados: number;
  empleadores: number;
  sinClasificar: number;
  completos: number;
  pendientes: number;
  sinEnvios: number;
  noAplica: number;
  encuestasAplicables: number;
  encuestasRespondidas: number;
  encuestasPendientes: number;
  porcentaje: number | null;
}

export interface PaginaSeguimiento {
  resumen: ResumenSeguimiento;
  contenido: PersonaResumenSeguimiento[];
  page: number;
  size: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface FiltrosSeguimiento {
  publico?: string;
  idEncuesta?: number;
  escuelaProfesional?: string;
  estado?: string;
  busqueda?: string;
  page: number;
  size: number;
}
