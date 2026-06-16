import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_MAIN_BASE } from '../shared/components/progress-bar/url';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private baseUrl = `${API_MAIN_BASE}/api/usuario`;

  constructor(private http: HttpClient) {}

  getByDni(dni: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${dni}`);
  }

  guardar(usuario: any): Observable<any> {
    return this.http.post(this.baseUrl, usuario);
  }
}
