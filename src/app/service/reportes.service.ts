import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../shared/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private api = 'http://localhost:8080/api/examen';
  private dashboardApi = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  obtenerReporteCompleto(idEncuesta: number, carrera?: string): Observable<any> {

    let url = `${this.api}/${idEncuesta}/reporte-completo`;

    if (carrera) {
      url += `?carrera=${encodeURIComponent(carrera)}`;
    }

    return this.http.get<any>(url);
  }

  obtenerReporteGlobal(carrera?: string): Observable<any> {

    let url = `${this.api}/reporte-global`;

    if (carrera) {
      url += `?carrera=${encodeURIComponent(carrera)}`;
    }

    return this.http.get<any>(url);
  }

  obtenerDashboard(idEncuesta?: number, facultad?: string): Observable<DashboardResponse> {

    let params = new HttpParams();

    if (idEncuesta !== undefined && idEncuesta !== null) {
      params = params.set('idEncuesta', idEncuesta.toString());
    }

    if (facultad && facultad.trim() !== '') {
      params = params.set('facultad', facultad.trim());
    }

    return this.http.get<DashboardResponse>(this.dashboardApi, { params });
  }
}
