import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EncuestaStateService } from '../../../core/services/encuesta-state.service';
import Swal from 'sweetalert2';

import { HttpClient } from '@angular/common/http';

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

 egresadoActual: any;
private readonly http = inject(HttpClient);
  modalInstrucciones = signal(false);
fotoUrl: string | null = null;
  egresado = this.stateService.egresadoActual;
  encuestasRespondidas = signal<number[]>([]);
  selectedEncuesta = signal<any | null>(null);

  encuestas = signal<any[]>([]);

respuestas = signal<Record<number, any>>({});

ngOnInit(): void {
  this.egresadoActual = JSON.parse(
    localStorage.getItem('egresadoActual') || '{}'
  );

  this.cargarFotoReniec(this.egresadoActual.dni);

  const idUsuario = this.egresadoActual.idUsuario;

  this.stateService.obtenerEncuestasRespondidas(idUsuario)
    .subscribe({
      next: (ids) => {
        this.encuestasRespondidas.set(ids);
        this.cargarEncuestas();
      }
    });
}
cargarFotoReniec(dni: string): void {
  const url = `/reniec/wsdl_reniec.php?dni=${dni}&downloadJSON=true`;

  this.http.get<any>(url).subscribe({
    next: (response) => {
      const persona = response?.result?.[0];

      if (!persona?.foto) {
        this.fotoUrl = null;
        return;
      }

      const base64 = persona.foto
        .replace(/\\\//g, '/')
        .replace(/\s/g, '')
        .trim();

      const mime = base64.startsWith('iVBORw0') ? 'image/png' : 'image/jpeg';
      this.fotoUrl = `data:${mime};base64,${base64}`;
    },
    error: (err) => {
      console.error('Error al cargar foto RENIEC:', err);
      this.fotoUrl = null;
    }
  });
}
cargarEncuestas(): void {

  const rolUsuario = localStorage.getItem('rolUsuario');
  const egresadoActual = this.stateService.egresadoActual();

  this.stateService.obtenerEncuestas().subscribe({
    next: (data) => {

      console.log('Todas las encuestas:', data);

      let filtradas = data.filter((e: any) =>
        e.cargo?.toLowerCase() === rolUsuario?.toLowerCase()
      );

      console.log('Encuestas por rol:', filtradas);

      if (egresadoActual?.fechaEgreso) {

        const anios = this.obtenerAniosDesdeEgreso(
          egresadoActual.fechaEgreso
        );

        console.log('Años desde egreso:', anios);

        filtradas = filtradas.filter((encuesta: any) => {

          const min = Math.min(
            encuesta.inicioRango,
            encuesta.finRango
          );

          const max = Math.max(
            encuesta.inicioRango,
            encuesta.finRango
          );

          return anios >= min && anios <= max;
        });
      }

      console.log('Encuestas filtradas finales:', filtradas);

      const respondidas = this.encuestasRespondidas().map(Number);

      console.log('IDs respondidas:', respondidas);

      const conEstado = filtradas.map((e: any) => ({
        ...e,
        respondida: respondidas.includes(Number(e.idEncuesta))
      }));

      console.log('Encuestas con estado:', conEstado);

      this.encuestas.set(conEstado);
    },

    error: (err) => {

      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las encuestas'
      });
    }
  });
}
get porcentajeProgreso(): number {
  return this.obtenerTotalPreguntas() === 0
    ? 0
    : Math.round(
        (this.obtenerRespondidas() /
          this.obtenerTotalPreguntas()) * 100
      );
}
iniciarEncuesta(encuesta: any): void {

  // Si ya fue respondida
  if (encuesta.respondida) {

    Swal.fire({
      icon: 'warning',
      title: 'Encuesta ya respondida',
      text: 'Esta encuesta ya fue completada anteriormente y no puede volver a responderse.',
      confirmButtonText: 'Entendido'
    });

    return;
  }

  // Si no fue respondida, navegar normalmente
  this.router.navigate([
    '/egresado/encuesta',
    encuesta.idEncuesta
  ]).then(ok => {
    console.log('Navegación:', ok);
  });
}
  cerrarModal(): void {
    this.modalInstrucciones.set(false);
    this.selectedEncuesta.set(null);
    this.respuestas.set({});
  }

seleccionarRespuesta(itemId: number, valor: any): void {
  this.respuestas.update(prev => ({
    ...prev,
    [itemId]: valor
  }));
}

  obtenerRespondidas(): number {
    return Object.keys(this.respuestas()).length;
  }

  obtenerTotalPreguntas(): number {

    const encuesta = this.selectedEncuesta();

    if (!encuesta) return 0;

    return encuesta.dimensiones.reduce(
      (total: number, d: any) => total + d.items.length,
      0
    );
  }

  encuestaCompleta(): boolean {
    return this.obtenerRespondidas() === this.obtenerTotalPreguntas();
  }

  // =========================
  // FINALIZAR Y ENVIAR (CORRECTO)
  // =========================
  finalizarEncuesta(): void {

    if (!this.encuestaCompleta()) {

      const faltan =
        this.obtenerTotalPreguntas() - this.obtenerRespondidas();

      Swal.fire({
        icon: 'warning',
        title: 'Encuesta incompleta',
        text: `Te faltan ${faltan} preguntas`
      });

      return;
    }

    const respuestasPayload = Object.entries(this.respuestas()).map(
      ([idItem, valor]) => ({
        idItem: Number(idItem),
        valor
      })
    );

const payload = {
  idUsuario: this.egresadoActual.idUsuario,
  idEncuesta: this.selectedEncuesta()?.idEncuesta,
  nombreEncuesta: this.selectedEncuesta()?.nombre,
  respuestas: respuestasPayload
};


    this.stateService.guardarRespuestasExamen(payload).subscribe({

      next: () => {

        const encuestaActual = this.selectedEncuesta();

        if (encuestaActual) {
          this.encuestasRespondidas.update(ids => [
            ...ids,
            encuestaActual.idEncuesta
          ]);
        }

        this.selectedEncuesta.set(null);
        this.respuestas.set({});
        this.modalInstrucciones.set(false);

        this.cargarEncuestas();

        Swal.fire({
          icon: 'success',
          title: 'Enviado',
          text: 'Encuesta guardada correctamente'
        });
      },

      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la encuesta'
        });
      }
    });
  }

  // =========================
  // UTIL
  // =========================
  obtenerAniosDesdeEgreso(fechaEgreso: string): number {

    const fecha = new Date(fechaEgreso);
    const hoy = new Date();

    return Math.floor(
      (hoy.getTime() - fecha.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    );
  }

readonly porcentaje = computed(() => {
  const encuestas = this.encuestas();
  const total = encuestas.length;
  if (total === 0) return 0;
  const respondidas = encuestas.filter(e => e.respondida).length;
  return Math.round((respondidas / total) * 100);
});
  logout(): void {
    this.stateService.logout();
    localStorage.clear();
    this.router.navigate(['/auth/selector-rol']);
  }
}
