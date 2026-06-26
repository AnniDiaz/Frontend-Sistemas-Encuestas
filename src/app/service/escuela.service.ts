import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_EGRESADO_BASE, API_MAIN_BASE } from '../shared/components/progress-bar/url';

@Injectable({
  providedIn: 'root'
})
export class EscuelaService {

  private apiUrl = `https://modsigau.unsm.edu.pe/api/getescuelas`;
  private apiInstrumentos = `${API_MAIN_BASE}/api/examen/nombres`;
  //cabo

  constructor(private http: HttpClient) {}

  obtenerEscuelas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  obtenerInstrumentos(): Observable<string[]> {
    return this.http.get<string[]>(this.apiInstrumentos);
  }
}
