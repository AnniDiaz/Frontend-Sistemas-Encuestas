// egresado.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EgresadoService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api';

  obtenerEgresado(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getegresado/${dni}`);
  }
}
