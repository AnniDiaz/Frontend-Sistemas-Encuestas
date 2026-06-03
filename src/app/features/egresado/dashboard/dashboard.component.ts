import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { computed } from '@angular/core';
import { EncuestaStateService } from '../../../core/services/encuesta-state.service';
import { TarjetaPerfilComponent } from '../tarjeta-perfil/tarjeta-perfil.component';
import { EncuestaFormularioComponent } from '../../../shared/components/encuesta-formulario/encuesta-formulario.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TarjetaPerfilComponent, EncuestaFormularioComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly stateService = inject(EncuestaStateService);
  private readonly router = inject(Router);

  // Expone el egresado actual
  egresado = this.stateService.egresadoActual;
  
  // Controla si se está mostrando el formulario de llenado
  mostrarFormulario: boolean = false;

  // Computed para saber si la encuesta está completada
  encuestaCompletada = computed(() => {
    const eg = this.egresado();
    return eg ? eg.encuestasCompletadas.length > 0 : false;
  });

  iniciarEncuesta(): void {
    this.mostrarFormulario = true;
  }

  onEncuestaFinalizada(): void {
    this.mostrarFormulario = false;
    // El signal computado de egresado() se actualizará automáticamente
  }

  logout(): void {
    this.stateService.logout();
    this.router.navigate(['/auth/selector-rol']);
  }
}
