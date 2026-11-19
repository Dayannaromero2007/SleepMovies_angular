import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuncionService } from '../../services/funcion';
import { PeliculaService } from '../../services/pelicula';

@Component({
  selector: 'app-funciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funciones.html'
})
export class FuncionesPage implements OnInit {
  funciones: any[] = [];
  peliculas: any[] = [];
  cargandoFunciones: boolean = true;
  errorConexion: string = '';

  funcionForm: any = { idPelicula: null, fechaHora: '', sala: '', precio: null, cuposDisponibles: null };
  editandoFuncion: boolean = false;
  mensajeFuncion: string = '';
  errorFuncion: string = '';

  constructor(
    private funcionService: FuncionService,
    private peliculaService: PeliculaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();
    this.cargarFunciones();
  }

  private mensajeDeError(err: any, porDefecto: string): string {
    return err?.error?.message || porDefecto;
  }

  private limpiarMensajesFuncion(): void {
    this.mensajeFuncion = '';
    this.errorFuncion = '';
  }

  private formularioFuncionVacio(): any {
    return { idPelicula: null, fechaHora: '', sala: '', precio: null, cuposDisponibles: null };
  }

  // Las películas se cargan para llenar la lista desplegable
  cargarPeliculas(): void {
    this.peliculaService.obtenerPeliculas().subscribe({
      next: (data) => {
        this.peliculas = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorConexion = 'No se pudo conectar con el servidor (puerto 8080).';
        console.error('Error al cargar películas:', err);
        this.cdr.detectChanges();
      }
    });
  }

  cargarFunciones(): void {
    this.funcionService.obtenerFunciones().subscribe({
      next: (data) => {
        this.funciones = data;
        this.cargandoFunciones = false;
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

  guardarFuncion(): void {
    this.limpiarMensajesFuncion();
    const f = this.funcionForm;

    if (!f.idPelicula) {
      this.errorFuncion = 'Selecciona una película.';
      this.cdr.detectChanges();
      return;
    }
    if (!f.fechaHora) {
      this.errorFuncion = 'Selecciona la fecha y la hora.';
      this.cdr.detectChanges();
      return;
    }
    if (!f.sala?.trim()) {
      this.errorFuncion = 'Escribe la sala.';
      this.cdr.detectChanges();
      return;
    }
    if (f.precio === null || f.precio === '' || Number(f.precio) <= 0) {
      this.errorFuncion = 'El precio debe ser mayor a 0.';
      this.cdr.detectChanges();
      return;
    }
    if (f.cuposDisponibles === null || f.cuposDisponibles === '' || Number(f.cuposDisponibles) < 0) {
      this.errorFuncion = 'Los cupos deben ser 0 o más.';
      this.cdr.detectChanges();
      return;
    }

    const datos: any = {
      fechaHora: f.fechaHora,
      sala: f.sala.trim(),
      precio: Number(f.precio),
      cuposDisponibles: Number(f.cuposDisponibles),
      pelicula: { idpeliculas: f.idPelicula }
    };

    if (this.editandoFuncion) {
      datos.idfunciones = f.idfunciones;
      this.funcionService.actualizarFunciones(f.idfunciones, datos).subscribe({
        next: () => {
          this.mensajeFuncion = 'Función actualizada correctamente.';
          this.cancelarEdicionFuncion(false);
          this.cargarFunciones();
        },
        error: (err) => {
          this.errorFuncion = this.mensajeDeError(err, 'No se pudo actualizar la función.');
          console.error('Error al actualizar funcion:', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.funcionService.registrarFunciones(datos).subscribe({
        next: () => {
          this.mensajeFuncion = 'Función creada correctamente.';
          this.funcionForm = this.formularioFuncionVacio();
          this.cargarFunciones();
        },
        error: (err) => {
          this.errorFuncion = this.mensajeDeError(err, 'No se pudo crear la función.');
          console.error('Error al crear funcion:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  editarFuncion(funcion: any): void {
    this.limpiarMensajesFuncion();
    this.funcionForm = {
      idfunciones: funcion.idfunciones,
      idPelicula: funcion.pelicula ? funcion.pelicula.idpeliculas : null,
      fechaHora: funcion.fechaHora ? String(funcion.fechaHora).substring(0, 16) : '',
      sala: funcion.sala,
      precio: funcion.precio,
      cuposDisponibles: funcion.cuposDisponibles
    };
    this.editandoFuncion = true;
    this.cdr.detectChanges();
  }

  cancelarEdicionFuncion(limpiarMensajes: boolean = true): void {
    if (limpiarMensajes) {
      this.limpiarMensajesFuncion();
    }
    this.funcionForm = this.formularioFuncionVacio();
    this.editandoFuncion = false;
    this.cdr.detectChanges();
  }

  eliminarFuncion(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar esta función?')) {
      return;
    }
    this.limpiarMensajesFuncion();
    this.funcionService.eliminarFunciones(id).subscribe({
      next: () => {
        this.mensajeFuncion = 'Función eliminada correctamente.';
        if (this.editandoFuncion && this.funcionForm.idfunciones === id) {
          this.cancelarEdicionFuncion(false);
        }
        this.cargarFunciones();
      },
      error: (err) => {
        this.errorFuncion = this.mensajeDeError(err, 'No se pudo eliminar la función.');
        console.error('Error al eliminar funcion:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
