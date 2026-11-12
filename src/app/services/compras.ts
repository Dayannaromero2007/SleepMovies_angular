import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComprasService {
  private apiUrl = 'http://localhost:8080/api/compras';
  constructor(private http: HttpClient) {}

  obtenerCompras(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
   registrarCompra(compra: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, compra);
  }

  actualizarCompra(id: number, compra: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, compra);
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
