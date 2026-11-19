import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuncionService } from '../../services/funcion';
import { ComprasService } from '../../services/compras';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html'
})
export class ComprasPage implements OnInit {
  funciones: any[] = [];
  errorConexion: string = '';

  compraForm: any = { idFuncion: null, nombreCliente: '', cantidadBoletas: null };
  enviandoCompra: boolean = false;
  mensajeCompra: string = '';
  errorCompra: string = '';

  constructor(
    private funcionService: FuncionService,
    private comprasService: ComprasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarFunciones();
  }

  private mensajeDeError(err: any, porDefecto: string): string {
    return err?.error?.message || porDefecto;
  }

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

  cargarFunciones(): void {
    this.funcionService.obtenerFunciones().subscribe({
      next: (data) => {
        this.funciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorConexion = 'No se pudo conectar con el servidor (puerto 8080).';
        console.error('Error al cargar funciones:', err);
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
