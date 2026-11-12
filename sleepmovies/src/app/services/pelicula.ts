import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import {Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PeliculaService {
  private apiUrl = 'http://localhost:8080/api/peliculas';
  constructor(private http: HttpClient) {}

  obtenerPeliculas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  registrarPeliculas(pelicula: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pelicula);
  }

  actualizarPeliculas(id: number, pelicula: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, pelicula);
  }

  eliminarPeliculas(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

}
