import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_MAIN_BASE } from '../shared/components/progress-bar/url';
import {
  FiltrosSeguimiento,
  PaginaSeguimiento,
  PersonaSeguimiento
} from '../shared/models/seguimiento.model';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private readonly apiUrl = `${API_MAIN_BASE}/api/reportes/seguimiento`;
  private readonly encuestasUrl = `${API_MAIN_BASE}/api/examen`;

  constructor(private http: HttpClient) {}

  obtenerEncuestas(): Observable<any[]> {
    return this.http.get<any[]>(this.encuestasUrl);
  }

  consultar(filtros: FiltrosSeguimiento): Observable<PaginaSeguimiento> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('size', filtros.size);

    if (filtros.publico) params = params.set('publico', filtros.publico);
    if (filtros.idEncuesta != null) params = params.set('idEncuesta', filtros.idEncuesta);
    if (filtros.escuelaProfesional) params = params.set('escuelaProfesional', filtros.escuelaProfesional);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda.trim());

    return this.http.get<PaginaSeguimiento>(this.apiUrl, { params });
  }

  obtenerDetalle(idUsuario: number, idEncuesta?: number): Observable<PersonaSeguimiento> {
    let params = new HttpParams();
    if (idEncuesta != null) params = params.set('idEncuesta', idEncuesta);
    return this.http.get<PersonaSeguimiento>(`${this.apiUrl}/${idUsuario}`, { params });
  }
}
