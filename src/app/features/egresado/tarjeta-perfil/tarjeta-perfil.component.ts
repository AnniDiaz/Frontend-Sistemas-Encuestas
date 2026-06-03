import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncuestaStateService } from '../../../core/services/encuesta-state.service';

@Component({
  selector: 'app-tarjeta-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-perfil.component.html',
  styleUrl: './tarjeta-perfil.component.css'
})
export class TarjetaPerfilComponent {
  private readonly stateService = inject(EncuestaStateService);

  // Expone el egresado actual para el template (un signal computado)
  egresado = this.stateService.egresadoActual;
}
