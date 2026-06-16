// egresado.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_EGRESADO_BASE } from '../../shared/components/progress-bar/url';

@Injectable({
  providedIn: 'root'
})
export class EgresadoService {

  private http = inject(HttpClient);

  private apiUrl = `${API_EGRESADO_BASE}/api`;

  obtenerEgresado(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getegresado/${dni}`);
  }
}
