import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
import { AuthService } from '../../../services/auth.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { NotificacionService } from '../../../services/notificacion.service';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historial-pedidos',
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, RatingModule, FormsModule],
  templateUrl: './historial-pedidos.component.html',
  styleUrl: './historial-pedidos.component.css'
})
export class HistorialPedidosComponent implements OnInit {
  ventas: any[] = [];
  usuarios: { [key: number]: any } = {}; // Mapeo de usuarios por ID
  ventaSeleccionada: any = null; // Venta seleccionada para el modal
  modalVerMasVisible: boolean = false; // Controla la visibilidad del modal
  modalFeedbackVisible: boolean = false;

  // Variables para el feedback
  valoracionGeneral: number = 0;
  comentarioGeneral: string = '';
  valoracionProducto: number = 0;
  comentarioProducto: string = '';
  valoracionEntrega: number = 0;
  comentarioEntrega: string = '';

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private notificacionService: NotificacionService
  ) { }

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

  abrirModalFeedback(venta: any): void {
    this.ventaSeleccionada = venta;
    this.modalFeedbackVisible = true;
  }

  cerrarModalFeedback(): void {
    this.modalFeedbackVisible = false;
    this.ventaSeleccionada = null;
    // Resetear valores
    this.valoracionGeneral = 0;
    this.comentarioGeneral = '';
    this.valoracionProducto = 0;
    this.comentarioProducto = '';
    this.valoracionEntrega = 0;
    this.comentarioEntrega = '';
  }

  crearFeedback(): void {
    if (this.valoracionProducto === 0 || this.valoracionEntrega === 0) {
      this.notificacionService.warn('Campos requeridos', 'Debes valorar al menos producto y entrega');
      return;
    }
  
    const payload = {
      order_id: this.ventaSeleccionada.id,
      delivery_rating: this.valoracionEntrega,
      delivery_comment: this.comentarioEntrega || 'Sin comentarios',
      product_feedbacks: [
        {
          product_id: Number(this.ventaSeleccionada.items[0].product.id), // 🟢 Asegúrate que sea correcto
          product_rating: this.valoracionProducto,
          product_comment: this.comentarioProducto || 'Sin comentarios'
        }
      ]
    };
  
    console.log('Payload a enviar:', payload);
  
    this.ordersService.createOrderFeedback(payload).subscribe({
      next: () => {
        this.notificacionService.success('Feedback enviado', 'Gracias por tu opinión');
        this.cerrarModalFeedback();
      },
      error: (err) => {
        console.error('Error al crear feedback:', err);
        this.notificacionService.error('Error', 'No se pudo enviar el feedback');
      }
    });
  }

  
}   
