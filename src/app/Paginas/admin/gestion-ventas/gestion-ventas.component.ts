import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
import { AuthService } from '../../../services/auth.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-gestion-ventas',
  imports: [CommonModule, TableModule, ButtonModule, DialogModule],
  templateUrl: './gestion-ventas.component.html',
  styleUrl: './gestion-ventas.component.css'
})
export class GestionVentasComponent implements OnInit {
  ventas: any[] = [];
  usuarios: { [key: number]: any } = {}; // Mapeo de usuarios por ID
  ventaSeleccionada: any = null; // Venta seleccionada para el modal
  modalVerMasVisible: boolean = false; // Controla la visibilidad del modal

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerVentas();
  }

  obtenerVentas(): void {
    this.ordersService.getVentas().subscribe({
      next: (res: any) => {
        console.log('Ventas obtenidas:', res);
        this.ventas = res.items.filter(
          (venta: any) => venta.payment?.payment_status === 'completed'
        );

        this.ventas.forEach((venta: any) => {
          const userId = venta.user;
          if (!this.usuarios[userId]) {
            this.authService.getUserById(userId).subscribe({
              next: (userData) => {
                this.usuarios[userId] = userData;
              },
              error: (err) => {
                console.error('Error al obtener usuario:', err);
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
      }
    });
  }

  getNombreUsuario(id: number): string {
    const usuario = this.usuarios[id];
    return usuario ? `${usuario.first_name} ${usuario.last_name}` : 'Cargando...';
  }

  abrirModalVerMas(venta: any): void {
    this.ventaSeleccionada = venta;
    this.modalVerMasVisible = true;
  }

  cerrarModalVerMas(): void {
    this.modalVerMasVisible = false;
    this.ventaSeleccionada = null;
  }
}