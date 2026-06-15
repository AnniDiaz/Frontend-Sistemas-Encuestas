import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { EncuestaStateService } from '../../../core/services/encuesta-state.service';
import { UsuarioService } from '../../../service/usuario.service';

@Component({
  selector: 'app-dashboard-empleador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private readonly stateService =
    inject(EncuestaStateService);

  private readonly usuarioService =
    inject(UsuarioService);

  private readonly router =
    inject(Router);

  empleadorActual: any;

  // =========================
  // REGISTRO EMPRESA
  // =========================

  mostrarRegistroEmpresa = false;

  rucTemporal = '';

  razonSocial = '';

  email = '';

  // =========================
  // ENCUESTAS
  // =========================

  modalInstrucciones = signal(false);

  encuestasRespondidas =
    signal<number[]>([]);

  selectedEncuesta =
    signal<any | null>(null);

  encuestas =
    signal<any[]>([]);

  respuestas =
    signal<Record<number, number>>({});

ngOnInit(): void {

  this.empleadorActual = JSON.parse(
    localStorage.getItem(
      'empleadorActual'
    ) || '{}'
  );

  const tieneEmpresaRegistrada =
    !!this.empleadorActual?.name &&
    !!this.empleadorActual?.email;

  if (!tieneEmpresaRegistrada) {

    this.rucTemporal =
      this.empleadorActual?.ruc ||
      this.empleadorActual?.dni ||
      localStorage.getItem(
        'rucTemporal'
      ) ||
      '';

    this.razonSocial =
      this.empleadorActual?.name || '';

    this.email =
      this.empleadorActual?.email || '';

    this.mostrarRegistroEmpresa = true;

    return;
  }

  this.mostrarRegistroEmpresa = false;

  this.cargarEncuestasRespondidas();
}

  // =========================
  // CARGAR RESPONDIDAS
  // =========================

  cargarEncuestasRespondidas(): void {

    const idUsuario =
      this.empleadorActual.idUsuario;

    this.stateService
      .obtenerEncuestasRespondidas(
        idUsuario
      )
      .subscribe({

        next: (ids) => {

          this.encuestasRespondidas
            .set(ids);

          this.cargarEncuestas();
        },

        error: () => {

          this.cargarEncuestas();
        }
      });
  }

  // =========================
  // GUARDAR EMPRESA
  // =========================

  guardarEmpresa(): void {

    if (!this.razonSocial.trim()) {

      Swal.fire({
        icon: 'warning',
        title: 'Razón social requerida',
        text: 'Ingrese la razón social de la empresa'
      });

      return;
    }

    if (!this.email.trim()) {

      Swal.fire({
        icon: 'warning',
        title: 'Correo requerido',
        text: 'Ingrese un correo electrónico'
      });

      return;
    }

const empresa = {

  idUsuario:
    this.empleadorActual?.idUsuario,

  dni:
    this.rucTemporal,

  ruc:
    this.rucTemporal,

  name:
    this.razonSocial,

  email:
    this.email,

  tipo:
    'empresa'
};
    this.usuarioService
      .guardar(empresa)
      .subscribe({

        next: (usuario: any) => {

          this.empleadorActual =
            usuario;

          localStorage.setItem(
            'empleadorActual',
            JSON.stringify(usuario)
          );

          localStorage.removeItem(
            'rucTemporal'
          );

          this.mostrarRegistroEmpresa =
            false;

          this.cargarEncuestasRespondidas();

          Swal.fire({
            icon: 'success',
            title: 'Datos guardados',
            text: 'La información de la empresa fue registrada correctamente'
          });
        },

        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar la empresa'
          });
        }
      });
  }

  // =========================
  // CARGAR ENCUESTAS
  // =========================

  cargarEncuestas(): void {

    const rolUsuario =
      localStorage.getItem(
        'rolUsuario'
      );

    this.stateService
      .obtenerEncuestas()
      .subscribe({

        next: (data) => {

          const respondidas =
            this.encuestasRespondidas();

          const filtradas = data
            .filter((e: any) =>
              e.cargo?.toLowerCase() ===
              rolUsuario?.toLowerCase()
            )
            .map((e: any) => ({
              ...e,
              respondida:
                respondidas.includes(
                  e.idEncuesta
                )
            }));

          this.encuestas.set(
            filtradas
          );
        },

        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las encuestas'
          });
        }
      });
  }

readonly porcentajeProgreso = computed(() => {

  const total = this.encuestas().length;

  if (total === 0) {
    return 0;
  }

  const respondidas =
    this.encuestasRespondidas().length;

  return Math.round(
    (respondidas / total) * 100
  );
});
  iniciarEncuesta(
    encuesta: any
  ): void {

    if (encuesta.respondida) {

      Swal.fire({
        icon: 'info',
        title: 'Ya completada',
        text: 'Esta encuesta ya fue respondida'
      });

      return;
    }

    this.selectedEncuesta.set(
      encuesta
    );

    this.respuestas.set({});

    this.modalInstrucciones.set(
      true
    );
  }

  cerrarModal(): void {

    this.modalInstrucciones.set(
      false
    );

    this.selectedEncuesta.set(
      null
    );

    this.respuestas.set({});
  }

  seleccionarRespuesta(
    itemId: number,
    valor: number
  ): void {
    this.respuestas.update(prev => ({
      ...prev,
      [itemId]: valor
    }));
  }

  obtenerRespondidas(): number {

    return Object.keys(
      this.respuestas()
    ).length;
  }

  obtenerTotalPreguntas(): number {

    const encuesta =
      this.selectedEncuesta();

    if (!encuesta) {
      return 0;
    }

    return encuesta.dimensiones.reduce(
      (
        total: number,
        d: any
      ) =>
        total +
        d.items.length,
      0
    );
  }

  encuestaCompleta(): boolean {

    return (
      this.obtenerRespondidas() ===
      this.obtenerTotalPreguntas()
    );
  }

  finalizarEncuesta(): void {

    if (!this.encuestaCompleta()) {

      const faltan =
        this.obtenerTotalPreguntas() -
        this.obtenerRespondidas();

      Swal.fire({
        icon: 'warning',
        title: 'Encuesta incompleta',
        text: `Faltan ${faltan} preguntas por responder`
      });

      return;
    }

const respuestasPayload =
  Object.entries(this.respuestas())
  .map(([idItem, valor]) => ({
    idItem: Number(idItem),
    valor: String(valor)
  }));

    const payload = {
      idUsuario: this.empleadorActual.idUsuario,
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

  this.encuestas.update(encuestas =>
    encuestas.map(e =>
      e.idEncuesta === encuestaActual.idEncuesta
        ? { ...e, respondida: true }
        : e
    )
  );
}
        this.cerrarModal();
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

  logout(): void {

    this.stateService.logout();

    localStorage.removeItem(
      'empleadorActual'
    );

    localStorage.removeItem(
      'rolUsuario'
    );

    localStorage.removeItem(
      'rucTemporal'
    );

    this.router.navigate([
      '/auth/selector-rol'
    ]);
  }
}
