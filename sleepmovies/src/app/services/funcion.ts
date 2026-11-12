import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable ({
  providedIn: 'root',
})
export class FuncionService {
  private apiUrl = 'http://localhost:8080/api/funciones';
  constructor(private http: HttpClient) {}

  obtenerFunciones(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  registrarFunciones(funcion: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, funcion);
  }

  actualizarFunciones(id: number, funcion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, funcion);
  }

  eliminarFunciones(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
