export interface DashboardKpis {
  totalRespuestas: number;
  egresadosEncuestados: number;
  promedioSatisfaccion: number;
  mejorEscuela: string;
  peorEscuela: string;
  tasaParticipacion: number;
}

export interface ComparativoPorEscuela {
  escuelaProfesional: string;
  promedioSatisfaccion: number;
  totalRespuestas: number;
}

export interface DistribucionSentimiento {
  categoria: string;
  porcentaje: number;
}

export interface RankingCalidadPregunta {
  codigo: string;
  descripcion: string;
  numero: number;
  promedio: number;
  estado: 'Bueno' | 'Regular' | 'Crítico';
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  comparativoPorEscuela: ComparativoPorEscuela[];
  distribucionSentimiento: DistribucionSentimiento[];
  rankingCalidadPreguntas: RankingCalidadPregunta[];
}
