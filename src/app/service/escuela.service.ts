import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EscuelaService {

  private apiUrl = 'http://127.0.0.1:8000/api/getescuelas';
  private apiInstrumentos = 'http://localhost:8080/api/examen/nombres';

  constructor(private http: HttpClient) {}

  obtenerEscuelas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  obtenerInstrumentos(): Observable<string[]> {
    return this.http.get<string[]>(this.apiInstrumentos);
  }
}
