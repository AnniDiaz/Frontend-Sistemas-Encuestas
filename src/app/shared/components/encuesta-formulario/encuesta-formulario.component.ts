import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncuestaStateService } from '../../../core/services/encuesta-state.service';
import { Dimension } from '../../models/encuesta.model';
import { EscalaLikertComponent } from '../escala-likert/escala-likert.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-encuesta-formulario',
  standalone: true,
  imports: [CommonModule, EscalaLikertComponent, ProgressBarComponent],
  templateUrl: './encuesta-formulario.component.html',
  styleUrl: './encuesta-formulario.component.css'
})
export class EncuestaFormularioComponent implements OnInit {
  private readonly stateService = inject(EncuestaStateService);

  @Output() encuestaFinalizada = new EventEmitter<void>();

  dimensiones: Dimension[] = [];
  currentIndex: number = 0; // Índice de la dimensión activa (0 a 3)

  ngOnInit(): void {
    const instrumento = this.stateService.getInstrumentoPorId(
      this.stateService.activeInstrumentoId()!
    );
    if (instrumento) {
      // Agrupar preguntas por dimensión (5 preguntas por dimensión)
      const preguntasPorDimension = 5;
      this.dimensiones = instrumento.dimensiones.map((nombre, idx) => ({
        idDimension: idx,
        nombre: nombre,
        codigo: `D${idx + 1}`,
        items: instrumento.preguntas.slice(
          idx * preguntasPorDimension,
          (idx + 1) * preguntasPorDimension
        )
      })) as Dimension[];
    }
  }

  get activeDimension(): Dimension {
    return this.dimensiones[this.currentIndex];
  }

  get progress(): number {
    const respuestas = this.stateService.tempAnswers();
    const totalItems = 5; // 5 preguntas por encuesta estándar
    return (respuestas.length / totalItems) * 100;
  }

  obtenerValorRespuesta(idPregunta: number): number | null {
    const respuestas = this.stateService.tempAnswers();
    const res = respuestas.find(r => r.idPregunta === idPregunta);
    return res ? res.valor : null;
  }

  registrarRespuesta(idPregunta: number, valor: number): void {
    this.stateService.guardarRespuestaEnCaliente(idPregunta, valor);
  }

  dimensionCompletada(dim: Dimension): boolean {
    const respuestas = this.stateService.tempAnswers();
    return dim.items.every(item => respuestas.some(r => r.idPregunta === item.idPregunta));
  }

  todasRespondidas(): boolean {
    const respuestas = this.stateService.tempAnswers();
    return respuestas.length === 5; // 5 preguntas por encuesta
  }

  siguiente(): void {
    if (this.currentIndex < this.dimensiones.length - 1) {
      this.currentIndex++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  atras(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  enviar(): void {
    if (this.todasRespondidas()) {
      const ok = this.stateService.finalizarInstrumentoActivo();
      if (ok) {
        this.encuestaFinalizada.emit();
      }
    } else {
      alert('Por favor responde todas las preguntas antes de finalizar la encuesta.');
    }
  }
}
