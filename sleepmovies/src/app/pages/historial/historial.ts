import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprasService } from '../../services/compras';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.html'
})
export class HistorialPage implements OnInit {
  compras: any[] = [];
  cargandoCompras: boolean = true;
  errorConexion: string = '';

  fechaDesde: string = '';
  fechaHasta: string = '';
  filtroActivo: boolean = false;
  errorHistorial: string = '';

  constructor(
    private comprasService: ComprasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  private mensajeDeError(err: any, porDefecto: string): string {
    return err?.error?.message || porDefecto;
  }

  get totalVentas(): number {
    return this.compras.reduce((suma, c) => suma + Number(c.valorTotal || 0), 0);
  }

  get totalBoletas(): number {
    return this.compras.reduce((suma, c) => suma + Number(c.cantidadBoletas || 0), 0);
  }

  cargarCompras(): void {
    const peticion = this.filtroActivo
      ? this.comprasService.obtenerHistorial(this.fechaDesde, this.fechaHasta)
      : this.comprasService.obtenerCompras();

    peticion.subscribe({
      next: (data: any) => {
        this.compras = data;
        this.cargandoCompras = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (this.filtroActivo) {
          this.errorHistorial = this.mensajeDeError(err, 'No se pudo consultar el historial.');
        } else {
          this.errorConexion = 'No se pudo conectar con el servidor (puerto 8080).';
        }
        this.cargandoCompras = false;
        console.error('Error al cargar compras:', err);
        this.cdr.detectChanges();
      }
    });
  }

  consultarHistorial(): void {
    this.errorHistorial = '';

    if (!this.fechaDesde || !this.fechaHasta) {
      this.errorHistorial = 'Selecciona las fechas "Desde" y "Hasta".';
      this.cdr.detectChanges();
      return;
    }
    if (this.fechaDesde > this.fechaHasta) {
      this.errorHistorial = 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".';
      this.cdr.detectChanges();
      return;
    }

    this.filtroActivo = true;
    this.cargarCompras();
  }

  consultarHoy(): void {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    this.fechaDesde = `${anio}-${mes}-${dia}`;
    this.fechaHasta = this.fechaDesde;
    this.consultarHistorial();
  }

  verTodasLasCompras(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.filtroActivo = false;
    this.errorHistorial = '';
    this.cargarCompras();
  }
}
