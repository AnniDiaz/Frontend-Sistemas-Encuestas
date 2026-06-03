import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-escala-likert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './escala-likert.component.html',
  styleUrl: './escala-likert.component.css'
})
export class EscalaLikertComponent {
  @Input() valorActivo: number | null = null;
  @Output() valorSeleccionado = new EventEmitter<number>();

  opciones = [
    { valor: 1, label: '1', descripcion: 'Muy en desacuerdo' },
    { valor: 2, label: '2', descripcion: 'En desacuerdo' },
    { valor: 3, label: '3', descripcion: 'Neutral' },
    { valor: 4, label: '4', descripcion: 'De acuerdo' },
    { valor: 5, label: '5', descripcion: 'Muy de acuerdo' }
  ];

  seleccionar(valor: number): void {
    this.valorSeleccionado.emit(valor);
  }
}
