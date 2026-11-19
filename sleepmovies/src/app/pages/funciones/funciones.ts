import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

  // Horarios del mes
  peliculaFiltro: number | null = null;
  mesVista: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  constructor(
    private funcionService: FuncionService,
    private peliculaService: PeliculaService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();
    this.cargarFunciones();

    // Si llegan desde el afiche de una película: /funciones?pelicula=3
    this.route.queryParamMap.subscribe(params => {
      const id = Number(params.get('pelicula'));
      this.peliculaFiltro = id > 0 ? id : null;
      this.cdr.detectChanges();
    });
  }

  // Funciones de la película elegida (o todas)
  get funcionesFiltradas(): any[] {
    return this.peliculaFiltro
      ? this.funciones.filter(f => f.pelicula?.idpeliculas === this.peliculaFiltro)
      : this.funciones;
  }

  // Funciones del mes que se está viendo, agrupadas por día y ordenadas por hora
  get diasDelMes(): { clave: string; fecha: Date; items: any[] }[] {
    const mapa = new Map<string, { clave: string; fecha: Date; items: any[] }>();
    for (const f of this.funcionesFiltradas) {
      if (!f.fechaHora) { continue; }
      const fecha = new Date(f.fechaHora);
      if (fecha.getFullYear() !== this.mesVista.getFullYear() || fecha.getMonth() !== this.mesVista.getMonth()) {
        continue;
      }
      const clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
      if (!mapa.has(clave)) {
        mapa.set(clave, { clave, fecha: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()), items: [] });
      }
      mapa.get(clave)!.items.push(f);
    }
    const dias = [...mapa.values()].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    for (const dia of dias) {
      dia.items.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
    }
    return dias;
  }

  get etiquetaMes(): string {
    return this.primeraMayuscula(this.mesVista.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }));
  }

  private primeraMayuscula(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  etiquetaDia(fecha: Date): string {
    return this.primeraMayuscula(
      fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '')
    );
  }

  cambiarMes(cambio: number): void {
    this.mesVista = new Date(this.mesVista.getFullYear(), this.mesVista.getMonth() + cambio, 1);
  }

  elegirPelicula(id: number | null): void {
    this.peliculaFiltro = id;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
