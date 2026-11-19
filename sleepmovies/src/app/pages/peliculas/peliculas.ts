import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeliculaService } from '../../services/pelicula';

@Component({
  selector: 'app-peliculas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './peliculas.html'
})
export class PeliculasPage implements OnInit {
  peliculas: any[] = [];
  cargandoPeliculas: boolean = true;
  errorConexion: string = '';

  peliculaForm: any = { titulo: '', genero: '', duracion: null, clasificacion: '' };
  editandoPelicula: boolean = false;
  idBusqueda: number | null = null;
  peliculaBuscada: any = null;
  mensajePelicula: string = '';
  errorPelicula: string = '';

  constructor(
    private peliculaService: PeliculaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();
  }

  private mensajeDeError(err: any, porDefecto: string): string {
    return err?.error?.message || porDefecto;
  }

  private limpiarMensajesPelicula(): void {
    this.mensajePelicula = '';
    this.errorPelicula = '';
  }

  private formularioPeliculaVacio(): any {
    return { titulo: '', genero: '', duracion: null, clasificacion: '' };
  }

  cargarPeliculas(): void {
    this.peliculaService.obtenerPeliculas().subscribe({
      next: (data) => {
        this.peliculas = data;
        this.cargandoPeliculas = false;
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

  buscarPelicula(): void {
    this.limpiarMensajesPelicula();
    this.peliculaBuscada = null;

    if (!this.idBusqueda || this.idBusqueda < 1) {
      this.errorPelicula = 'Escribe un ID válido para buscar.';
      this.cdr.detectChanges();
      return;
    }

    const id = this.idBusqueda;
    this.peliculaService.obtenerPeliculaPorId(id).subscribe({
      next: (data) => {
        this.peliculaBuscada = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorPelicula = err.status === 404
          ? `No existe una película con el ID ${id}.`
          : this.mensajeDeError(err, 'No se pudo buscar la película.');
        this.cdr.detectChanges();
      }
    });
  }

  limpiarBusqueda(): void {
    this.idBusqueda = null;
    this.peliculaBuscada = null;
    this.limpiarMensajesPelicula();
    this.cdr.detectChanges();
  }

  guardarPelicula(): void {
    this.limpiarMensajesPelicula();
    const p = this.peliculaForm;

    if (!p.titulo?.trim() || !p.genero?.trim() || !p.clasificacion?.trim() || !p.duracion || p.duracion < 1) {
      this.errorPelicula = 'Completa título, género, duración (mayor a 0) y clasificación.';
      this.cdr.detectChanges();
      return;
    }

    const datos: any = {
      titulo: p.titulo.trim(),
      genero: p.genero.trim(),
      duracion: Number(p.duracion),
      clasificacion: p.clasificacion.trim()
    };

    if (this.editandoPelicula) {
      datos.idpeliculas = p.idpeliculas;
      this.peliculaService.actualizarPeliculas(p.idpeliculas, datos).subscribe({
        next: () => {
          this.mensajePelicula = 'Película actualizada correctamente.';
          this.cancelarEdicionPelicula(false);
          this.peliculaBuscada = null;
          this.cargarPeliculas();
        },
        error: (err) => {
          this.errorPelicula = this.mensajeDeError(err, 'No se pudo actualizar la película.');
          console.error('Error al actualizar película:', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.peliculaService.registrarPeliculas(datos).subscribe({
        next: () => {
          this.mensajePelicula = 'Película creada correctamente.';
          this.peliculaForm = this.formularioPeliculaVacio();
          this.cargarPeliculas();
        },
        error: (err) => {
          this.errorPelicula = this.mensajeDeError(err, 'No se pudo crear la película.');
          console.error('Error al crear película:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  editarPelicula(pelicula: any): void {
    this.limpiarMensajesPelicula();
    this.peliculaForm = { ...pelicula };
    this.editandoPelicula = true;
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicionPelicula(limpiarMensajes: boolean = true): void {
    if (limpiarMensajes) {
      this.limpiarMensajesPelicula();
    }
    this.peliculaForm = this.formularioPeliculaVacio();
    this.editandoPelicula = false;
    this.cdr.detectChanges();
  }

  eliminarPelicula(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar esta película?')) {
      return;
    }
    this.limpiarMensajesPelicula();
    this.peliculaService.eliminarPeliculas(id).subscribe({
      next: () => {
        this.mensajePelicula = 'Película eliminada correctamente.';
        if (this.peliculaBuscada?.idpeliculas === id) {
          this.peliculaBuscada = null;
        }
        if (this.editandoPelicula && this.peliculaForm.idpeliculas === id) {
          this.cancelarEdicionPelicula(false);
        }
        this.cargarPeliculas();
      },
      error: (err) => {
        this.errorPelicula = this.mensajeDeError(err, 'No se pudo eliminar la película.');
        console.error('Error al eliminar pelicula:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
