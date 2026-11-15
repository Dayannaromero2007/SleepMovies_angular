import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeliculaService } from './services/pelicula';
import { FuncionService } from './services/funcion';
import { ComprasService } from './services/compras';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  peliculas: any[] = [];
  funciones: any[] = [];
  compras: any[] = [];
  errorConexion: string = '';
  cargandoPeliculas: boolean = true;
  cargandoFunciones: boolean = true;
  cargandoCompras: boolean = true;

  constructor(
    private peliculaService: PeliculaService,
    private funcionService: FuncionService,
    private comprasService: ComprasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();
    this.cargarFunciones();
    this.cargarCompras();
  }

  cargarPeliculas(): void {
    this.peliculaService.obtenerPeliculas().subscribe({
      next: (data) => {
        this.peliculas = data;
        this.cargandoPeliculas = false;
        console.log('Películas cargadas con éxito:', data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorConexion = 'No se pudo conectar con el servidor (puerto 8080).';
        this.cargandoPeliculas = false;
        console.error('Error al cargar películas:', err);
        this.cdr.detectChanges();
      }
    });
  }

  eliminarPelicula(id: number): void {
    this.peliculaService.eliminarPeliculas(id).subscribe({
      next:  () => {
        console.log('Pelicula eliminada:', id);
        this.cargarPeliculas();
      },
      error: (err) => console.error('Error al eliminar pelicula:', err)
    });
  }

  editarPelicula(pelicula: any): void {
    const cambios = { ...pelicula, titulo: pelicula.titulo + ' (editado)'};
    this.peliculaService.actualizarPeliculas(pelicula.idpeliculas, cambios).subscribe({
      next: () => {
        console.log('Pelicula actualizada:', pelicula.idpeliculas);
        this.cargarPeliculas();
      },
      error: (err) => console.error('Error al actualizar peliculas:', err)
    });
  }

  cargarFunciones(): void {
    this.funcionService.obtenerFunciones().subscribe({
      next: (data) => {
        this.funciones = data;
        this.cargandoFunciones = false;
        console.log('Funciones cargadas con éxito:', data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorConexion = 'No se pudo conectar con el servidor (puerto 8080).';
        this.cargandoFunciones = false;
        console.error('Error al cargar funciones:', err);
        this.cdr.detectChanges();
      }
    });
  }

  eliminarFuncion(id: number): void {
    this.funcionService.eliminarFunciones(id).subscribe({
      next: () => {
        console.log('Funcion eliminada:', id);
        this.cargarFunciones();
      },
      error: (err) => console.error('Error al eliminar funcion:', err)
    });
  }

  editarFuncion(funcion: any): void {
    const cambios = { ...funcion, cuposDisponibles: funcion.cuposDisponibles - 1 };
    this.funcionService.actualizarFunciones(funcion.idfunciones, cambios).subscribe({
      next: () => {
        console.log('Funcion actualizada;', funcion.idfunciones);
        this.cargarFunciones();
      },
      error: (err) => console.error('Error al actualizar funcion:', err)
    });
  }

  cargarCompras(): void {
    this.comprasService.obtenerCompras().subscribe({
      next: (data) => {
        this.compras = data;
        this.cargandoCompras = false;
        console.log('Compras cargadas con éxito:', data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorConexion = 'No se pudo conectar con el servidor (puerto 8080).';
        this.cargandoCompras = false;
        console.error('Error al cargar compras:', err);
        this.cdr.detectChanges();
      }
    });
  }
  eliminarCompra(id: number): void {
    this.comprasService.eliminarCompra(id).subscribe({
      next: () => {
        console.log('Compra eliminada:', id);
        this.cargarCompras();
      },
      error: (err) => console.error('Error al eliminar compra:', err)
    });
  }

  editarCompra(compra: any): void {
    const cambios = {
      ...compra,
      nombreCliente: compra.nombreCliente + ' (editado)',
      cantidadBoletas: compra.cantidadBoletas + 1
    };
    this.comprasService.actualizarCompra(compra.idcompras, cambios).subscribe({
      next: () => {
        console.log('Compra actualizada:', compra.idcompras);
        this.cargarCompras();
      },
      error: (err) => console.error('Error al actualizar compra:', err)
    });
  }
}
