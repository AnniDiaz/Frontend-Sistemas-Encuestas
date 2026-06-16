import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_EGRESADO_BASE } from '../shared/components/progress-bar/url';

@Injectable({ providedIn: 'root' })
export class EgresadoService {

  private baseUrl = `${API_EGRESADO_BASE}/api`;

  constructor(private http: HttpClient) {}

  buscarPorDni(dni: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getegresado/${dni}`);
  }
}
