import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EncuestaStateService } from '../../core/services/encuesta-state.service';

@Component({
  selector: 'app-encuesta-responder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuesta-responder.component.html',
  styleUrl: './encuesta-responder.component.css'
})
export class EncuestaResponderComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly encuestaService = inject(EncuestaStateService);

  private rol = '';

  encuesta = signal<any>(null);
  nombreEncuesta = signal<string>('Encuesta');
  respuestas = signal<Record<number, any>>({});
  progreso = signal(0);

  private totalPreguntas = 0;

  ngOnInit(): void {

    this.rol = this.route.snapshot.data['rol'] || 'egresado';

    const nombre = history.state?.nombreEncuesta;
    if (nombre) {
      this.nombreEncuesta.set(nombre);
    }

    const idEncuesta = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!idEncuesta) {
      console.error('ID de encuesta inválido');
      return;
    }

    this.cargarEncuesta(idEncuesta);
  }

  private getUsuarioActual(): any {
    const key = this.rol === 'empleador' ? 'empleadorActual' : 'egresadoActual';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  private rutaDashboard(): string {
    return this.rol === 'empleador' ? '/empleador' : '/egresado';
  }

  cargarEncuesta(idEncuesta: number): void {

    this.encuestaService
      .obtenerEncuestaPorId(idEncuesta)
      .subscribe({
        next: (data) => {

          console.log(
            'Encuesta obtenida:',
            data
          );

          this.encuesta.set(data);
          this.totalPreguntas = (data.dimensiones ?? [])
            .flatMap((d: any) => d.items ?? []).length;
        },
        error: (err) => {
          console.error(
            'Error al obtener encuesta',
            err
          );
        }
      });
  }

seleccionarRespuesta(
  idItem: number,
  valor: any
): void {

  this.respuestas.update(prev => ({
    ...prev,
    [idItem]: valor
  }));

  const respondidas = Object.keys(this.respuestas()).length;
  this.progreso.set(
    this.totalPreguntas > 0
      ? Math.round((respondidas / this.totalPreguntas) * 100)
      : 0
  );
}

enviarEncuesta(): void {

  const encuesta = this.encuesta();

  if (!encuesta) {
    return;
  }

  // Total de preguntas de la encuesta
  const totalItems =
    encuesta.dimensiones
      .flatMap((d: any) => d.items || [])
      .length;

  // Total respondidas
  const totalRespondidas =
    Object.keys(this.respuestas()).length;

  // Validación
  if (totalRespondidas < totalItems) {

    Swal.fire({
      icon: 'warning',
      title: 'Encuesta incompleta',
      text: 'Debe responder todas las preguntas antes de enviar la encuesta.',
      confirmButtonText: 'Aceptar'
    });

    return;
  }

  const usuario = this.getUsuarioActual();

  if (!usuario) {

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se encontró información del usuario.'
    });

    return;
  }

  const idEncuesta = Number(this.route.snapshot.paramMap.get('id'));

  const respuestasPayload =
    Object.entries(this.respuestas())
      .map(([idItem, valor]) => ({
        idItem: Number(idItem),
        valor: String(valor)
      }));

  const payload = {
    idUsuario: usuario.idUsuario,
    idEncuesta,
    nombreEncuesta: this.nombreEncuesta(),
    respuestas: respuestasPayload
  };

  console.log('Payload enviado:', payload);

  this.encuestaService
    .guardarRespuestasExamen(payload)
    .subscribe({
      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Encuesta enviada',
          text: 'Sus respuestas fueron registradas correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {

          this.router.navigate([this.rutaDashboard()]);

        });

      },
      error: (err) => {

        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un problema al guardar la encuesta.'
        });

      }
    });

}
  volver(): void {
    this.router.navigate([this.rutaDashboard()]);
  }
}
