import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EncuestaStateService } from '../../../core/services/encuesta-state.service';

interface Pregunta {
  id: number;
  texto: string;
}

interface OpcionLikert {
  valor: number;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-dashboard-empleador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly stateService = inject(EncuestaStateService);
  private readonly router = inject(Router);

  encuestaIniciada: boolean = false;
  errorFormulario: boolean = false;
  preguntaActual: number = 0;

  // Guarda respuestas por id de pregunta
  respuestas: { [key: number]: number } = {};

  // Escala Likert con emojis tal como la imagen
  opcionesLikert: OpcionLikert[] = [
    { valor: 1, label: 'Muy Insatisfecho / Total Desacuerdo',     emoji: '😞' },
    { valor: 2, label: 'Insatisfecho / En Desacuerdo',           emoji: '😕' },
    { valor: 3, label: 'Neutral / Ni de acuerdo ni en desacuerdo', emoji: '😐' },
    { valor: 4, label: 'Satisfecho / De Acuerdo',                emoji: '🙂' },
    { valor: 5, label: 'Muy Satisfecho / Totalmente de Acuerdo', emoji: '😄' },
  ];

  // 20 preguntas del Instrumento ID29
  preguntas: Pregunta[] = [
    { id: 1,  texto: 'Habilidad para resolver problemas de manera ágil y crítica ante imprevistos.' },
    { id: 2,  texto: 'Nivel de dominio técnico y herramientas de especialización del programa en las labores asignadas.' },
    { id: 3,  texto: 'Capacidad para comunicarse de forma asertiva, oral y escrita, en los distintos niveles de la organización.' },
    { id: 4,  texto: 'Disposición, liderazgo y efectividad para cooperar e integrarse en dinámicas de trabajo en equipo.' },
    { id: 5,  texto: 'Demostración de valores éticos, responsabilidad profesional y compromiso social en su centro laboral.' },
    { id: 6,  texto: 'Capacidad para identificar debilidades críticas y formular soluciones técnicas estructuradas e innovadoras.' },
    { id: 7,  texto: 'Proactividad, iniciativa y autonomía demostrada en la ejecución de sus proyectos y responsabilidades.' },
    { id: 8,  texto: 'Capacidad de adaptación al cambio tecnológico, metodologías ágiles y nuevas regulaciones de la industria.' },
    { id: 9,  texto: 'Nivel de puntualidad, disciplina, orden y cumplimiento estricto de las metas operativas encomendadas.' },
    { id: 10, texto: 'Habilidad para organizar el tiempo de entrega y priorizar tareas bajo escenarios de alta presión.' },
    { id: 11, texto: 'Nivel de orientación a la calidad del servicio, optimización de recursos y atención al detalle.' },
    { id: 12, texto: 'Uso estratégico de tecnologías de la información, softwares avanzados y equipamiento especializado.' },
    { id: 13, texto: 'Capacidad analítica para el procesamiento de datos complejos y formulación objetiva de informes de gestión.' },
    { id: 14, texto: 'Dominio de segundos idiomas o lenguajes técnicos requeridos para las operaciones de la empresa.' },
    { id: 15, texto: 'Compromiso evidente con su autoaprendizaje y la actualización continua en su campo profesional.' },
    { id: 16, texto: 'Habilidad gerencial para la toma de decisiones oportunas y manejo inteligente de conflictos interpersonales.' },
    { id: 17, texto: 'Nivel de adaptabilidad cultural y respeto por la biodiversidad y normativas ambientales en sus tareas.' },
    { id: 18, texto: 'Nivel de madurez profesional y resiliencia frente a contingencias organizacionales inesperadas.' },
    { id: 19, texto: '¿Volvería usted a contratar de forma prioritaria a un egresado procedente de este programa de la UNSM?' },
    { id: 20, texto: 'Valoración general integralizada del desempeño profesional e impacto del egresado dentro de su organización.' },
  ];

  get porcentajeProgreso(): number {
    return Math.round((this.getRespuestasCount() / this.preguntas.length) * 100);
  }

  ngOnInit(): void {}

  getRespuestasCount(): number {
    return Object.keys(this.respuestas).length;
  }

  getPorcentajeRespondido(): number {
    return Math.round((this.getRespuestasCount() / this.preguntas.length) * 100);
  }

  comenzarEncuesta(): void {
    this.encuestaIniciada = true;
    this.preguntaActual = 0;
    this.errorFormulario = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEncuesta(): void {
    this.encuestaIniciada = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  seleccionarValor(preguntaId: number, valor: number): void {
    this.respuestas[preguntaId] = valor;
  }

  prevPregunta(): void {
    if (this.preguntaActual > 0) {
      this.preguntaActual--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPregunta(): void {
    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  enviarEncuesta(): void {
    const totalRespondidas = this.getRespuestasCount();
    if (totalRespondidas < this.preguntas.length) {
      this.errorFormulario = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.errorFormulario = false;
    alert('¡Encuesta Institucional (ID29) guardada y enviada al sistema de Aseguramiento de la Calidad OTI exitosamente!');
    this.logout();
  }

  logout(): void {
    this.stateService.logout();
    this.router.navigate(['/auth/selector-rol']);
  }
}