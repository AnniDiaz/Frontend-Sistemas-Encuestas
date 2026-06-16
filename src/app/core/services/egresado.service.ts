// egresado.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EgresadoService {

  private http = inject(HttpClient);

  private apiUrl = 'http://192.168.50.108:8004/api';

  obtenerEgresado(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getegresado/${dni}`);
  }
}
