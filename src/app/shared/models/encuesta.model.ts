export interface Pregunta {
  idPregunta: number;
  numero: number;
  texto: string;
  criterio?: string;
}

export interface Dimension {
  idDimension: number;
  nombre: string;
  codigo: string;
  items: Pregunta[];
}

export interface Instrumento {
  idInstrumento: string; // e.g., 'ID20', 'ID21', 'ID22', 'ID23', 'ID24', 'ID26', 'ID27'
  nombre: string;
  descripcion: string;
  dimensiones: string[]; // names of dimensions evaluated
  preguntas: Pregunta[];
}

export interface RespuestaPregunta {
  idPregunta: number;
  valor: number; // 1-5 scale
}

export interface Egresado {
  dni: string;
  nombre: string;
  carrera: string;
  facultad: string;
  email: string;
  celular: string;
  anioGraduacion: string;
  perfilTipo: 'estandar' | 'tramites' | 'reciente'; // For dynamic survey segmentation
  encuestasCompletadas: string[]; // List of completed instrument IDs (e.g. ['ID20'])
  respuestas: { [idInstrumento: string]: RespuestaPregunta[] };
}
