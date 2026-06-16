import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private baseUrl = 'http://192.168.50.108:8080//api/usuario';

  constructor(private http: HttpClient) {}

  getByDni(dni: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${dni}`);
  }

  guardar(usuario: any): Observable<any> {
    return this.http.post(this.baseUrl, usuario);
  }
}
