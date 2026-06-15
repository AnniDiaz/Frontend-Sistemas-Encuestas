import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RucService {

  private baseUrl = 'https://api.decolecta.com/v1/ruc';

  constructor(private http: HttpClient) {}

  consultarRuc(ruc: string) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.decolectaKey}`
    });

    return this.http.get(`${this.baseUrl}/${ruc}`, { headers });
  }
}