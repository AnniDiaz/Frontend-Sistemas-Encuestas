import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_MAIN_BASE } from '../../shared/components/progress-bar/url';

export interface Egresado {
  dni: string;

  name: string;
  paternalSurname: string;
  maternalSurname: string;

  email: string;
  phoneNumber: string;

  escuelaProfesional: string;
  facultad: string;

  fechaEgreso: string;
  semestreEgreso: string;

  yearsFromGraduation?: number;
}

export interface RespuestaExamenItem {
  idItem: number;
  valor: string;
}

export interface GuardarRespuestasExamenPayload {
  idUsuario: number;
  respuestas: RespuestaExamenItem[];
}

@Injectable({
  providedIn: 'root'
})
export class EncuestaStateService {

  private http = inject(HttpClient);

  private apiUrl = `${API_MAIN_BASE}/api/examen`;
  private readonly respuestasUrl = `${API_MAIN_BASE}/api/respuestas/examen`;

  // ==========================
  // ENCUESTAS
  // ==========================

  readonly encuestas = signal<any[]>([]);

  private readonly _encuestaSeleccionada =
    signal<any | null>(null);

  readonly encuestaSeleccionada = computed(
    () => this._encuestaSeleccionada()
  );

  setEncuestaSeleccionada(encuesta: any): void {
    this._encuestaSeleccionada.set(encuesta);
  }
obtenerEncuestaPorId(
  idEncuesta: number
): Observable<any> {

  return this.http.get<any>(
    `${this.apiUrl}/${idEncuesta}`
  );
}
  obtenerEncuestas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
obtenerEncuestasRespondidas(
  idUsuario: number
): Observable<number[]> {

  return this.http.get<number[]>(
    `${API_MAIN_BASE}/api/respuestas/respondidas/${idUsuario}`
  );
}
  guardarRespuestasExamen(
    payload: GuardarRespuestasExamenPayload
  ): Observable<any> {
    return this.http.post<any>(
      this.respuestasUrl,
      payload
    );
  }

  cargarEncuestas(): void {
    this.obtenerEncuestas().subscribe({
      next: (data) => this.encuestas.set(data),
      error: (err) => console.error(err)
    });
  }

  // ==========================
  // EGRESADO ACTUAL
  // ==========================

  private readonly _egresadoActual =
    signal<Egresado | null>(null);

  constructor() {

    const egresadoGuardado =
      localStorage.getItem('egresadoActual');

    if (egresadoGuardado) {
      this._egresadoActual.set(
        JSON.parse(egresadoGuardado)
      );
    }
  }

  readonly egresadoActual = computed(
    () => this._egresadoActual()
  );

  setEgresadoActual(egresado: Egresado): void {

    this._egresadoActual.set(egresado);

    localStorage.setItem(
      'egresadoActual',
      JSON.stringify(egresado)
    );
  }

  logout(): void {

    this._egresadoActual.set(null);

    localStorage.removeItem('egresadoActual');
    localStorage.removeItem('dni');
    localStorage.removeItem('rolUsuario');
  }

  // ==========================
  // FILTRO POR RANGO DE AÑOS
  // ==========================

  calcularAñosDesdeEgreso(
    fechaEgreso: string
  ): number {

    const hoy = new Date();
    const fecha = new Date(fechaEgreso);

    let años =
      hoy.getFullYear() -
      fecha.getFullYear();

    const mesActual = hoy.getMonth();
    const mesEgreso = fecha.getMonth();

    if (mesActual < mesEgreso) {
      años--;
    }

    return Math.max(0, años);
  }

  cumpleConRangoEncuesta(
    egresado: Egresado,
    encuesta: any
  ): boolean {

    const yearsFromGraduation =
      egresado.yearsFromGraduation ??
      this.calcularAñosDesdeEgreso(
        egresado.fechaEgreso
      );

    const { inicioRango, finRango } =
      encuesta;

    const min = Math.min(
      inicioRango,
      finRango
    );

    const max = Math.max(
      inicioRango,
      finRango
    );

    return (
      yearsFromGraduation >= min &&
      yearsFromGraduation <= max
    );
  }

  filtrarEncuestasPorRango(
    encuestas: any[],
    egresado: Egresado | null
  ): any[] {

    if (!egresado) {
      return [];
    }

    return encuestas.filter(encuesta =>
      this.cumpleConRangoEncuesta(
        egresado,
        encuesta
      )
    );
  }
}
