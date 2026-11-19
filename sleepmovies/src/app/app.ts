import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeliculaService } from './services/pelicula';
import { FuncionService } from './services/funcion';
import { ComprasService } from './services/compras';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
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

  // --- Sección Películas: formulario, búsqueda y mensajes ---
  peliculaForm: any = { titulo: '', genero: '', duracion: null, clasificacion: '' };
  editandoPelicula: boolean = false;
  idBusqueda: number | null = null;
  peliculaBuscada: any = null;
  mensajePelicula: string = '';
  errorPelicula: string = '';


  // --- Sección Funciones: formulario y mensajes ---
  funcionForm: any = { idPelicula: null, fechaHora: '', sala: '', precio: null, cuposDisponibles: null };
  editandoFuncion: boolean = false;
  mensajeFuncion: string = '';
  errorFuncion: string = '';


  // --- Sección Compra de Boletas: formulario y mensajes ---
  compraForm: any = { idFuncion: null, nombreCliente: '', cantidadBoletas: null };
  enviandoCompra: boolean = false;
  mensajeCompra: string = '';
  errorCompra: string = '';

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

  // ================= PELÍCULAS =================

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
        console.log('Pelicula eliminada:', id);
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

    // ================= FUNCIONES =================

  private limpiarMensajesFuncion(): void {
    this.mensajeFuncion = '';
    this.errorFuncion = '';
  }

  private formularioFuncionVacio(): any {
    return { idPelicula: null, fechaHora: '', sala: '', precio: null, cuposDisponibles: null };
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
        console.log('Funcion eliminada:', id);
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

    // ================= COMPRAS =================

  get funcionSeleccionada(): any {
    return this.funciones.find(f => f.idfunciones === this.compraForm.idFuncion) ?? null;
  }

  get totalCalculado(): number {
    const funcion = this.funcionSeleccionada;
    const cantidad = Number(this.compraForm.cantidadBoletas);
    return funcion && cantidad > 0 ? funcion.precio * cantidad : 0;
  }

  private limpiarMensajesCompra(): void {
    this.mensajeCompra = '';
    this.errorCompra = '';
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

  comprarBoletas(): void {
    this.limpiarMensajesCompra();
    const c = this.compraForm;

    if (!c.idFuncion) {
      this.errorCompra = 'Selecciona una función.';
      this.cdr.detectChanges();
      return;
    }
    if (!c.nombreCliente?.trim()) {
      this.errorCompra = 'Escribe el nombre del cliente.';
      this.cdr.detectChanges();
      return;
    }
    const cantidad = Number(c.cantidadBoletas);
    if (!cantidad || cantidad < 1 || !Number.isInteger(cantidad)) {
      this.errorCompra = 'La cantidad de boletas debe ser un número entero de 1 o más.';
      this.cdr.detectChanges();
      return;
    }

    const datos = {
      nombreCliente: c.nombreCliente.trim(),
      cantidadBoletas: cantidad,
      funcion: { idfunciones: c.idFuncion }
    };

    this.enviandoCompra = true;
    this.comprasService.registrarCompra(datos).subscribe({
      next: (compra) => {
        const total = Number(compra.valorTotal).toLocaleString('es-CO', {
          style: 'currency', currency: 'COP', maximumFractionDigits: 0
        });
        this.mensajeCompra = `Compra registrada correctamente. Total pagado: ${total}`;
        this.compraForm = { idFuncion: null, nombreCliente: '', cantidadBoletas: null };
        this.enviandoCompra = false;
        this.cargarCompras();
        this.cargarFunciones();
      },
      error: (err) => {
        this.errorCompra = err.status === 409
          ? 'Compra rechazada. ' + this.mensajeDeError(err, 'Cupos insuficientes.')
          : this.mensajeDeError(err, 'No se pudo registrar la compra.');
        this.enviandoCompra = false;
        console.error('Error al registrar compra:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
