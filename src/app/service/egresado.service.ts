import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EgresadoService {

  private baseUrl = 'http://192.168.50.108:8004/api';

  constructor(private http: HttpClient) {}

  buscarPorDni(dni: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getegresado/${dni}`);
  }
}
