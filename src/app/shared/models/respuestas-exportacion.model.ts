export interface PreguntaExportacion {
  idItem: number;
  numero: number;
  texto: string;
  idDimension: number;
  dimensionNombre: string;
  dimensionCodigo: string;
}

export interface FilaExportacionRespuestas {
  dni: string;
  nombreCompleto: string;
  facultad: string;
  escuelaProfesional: string;
  respuestas: string[];
}

export interface ExportacionRespuestasResponse {
  idEncuesta: number;
  nombreEncuesta: string;
  preguntas: PreguntaExportacion[];
  filas: FilaExportacionRespuestas[];
}
