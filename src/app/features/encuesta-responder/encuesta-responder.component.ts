import {
  Component,
  computed,
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

  encuesta = signal<any>(null);

respuestas = signal<Record<number, any>>({});
  progreso = computed(() => {

    const encuesta = this.encuesta();

    if (!encuesta?.dimensiones) {
      return 0;
    }

    const totalItems =
      encuesta.dimensiones
        .flatMap((d: any) => d.items || [])
        .length;

    const respondidas =
      Object.keys(this.respuestas()).length;

    return totalItems > 0
      ? Math.round(
          (respondidas / totalItems) * 100
        )
      : 0;
  });

  ngOnInit(): void {

    const idEncuesta = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!idEncuesta) {
      console.error('ID de encuesta inválido');
      return;
    }

    this.cargarEncuesta(idEncuesta);
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

  // Obtener usuario del localStorage
  const egresadoStorage =
    localStorage.getItem('egresadoActual');

  if (!egresadoStorage) {

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se encontró información del usuario.'
    });

    return;
  }

  const egresado =
    JSON.parse(egresadoStorage);

const respuestasPayload =
  Object.entries(this.respuestas())
    .map(([idItem, valor]) => ({
      idItem: Number(idItem),
      valor: String(valor)
    }));

  const payload = {
    idUsuario: egresado.idUsuario,
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

          this.router.navigate([
            '/dashboard-empleador'
          ]);

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

    this.router.navigate([
      '/dashboard-empleador'
    ]);
  }
}
