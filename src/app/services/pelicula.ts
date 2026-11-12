import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class PeliculaService {
  private apiUrl = 'http://localhost:8080/api/peliculas';
  constructor(private http: HttpClient) {}

  obtenerPeliculas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }



}

