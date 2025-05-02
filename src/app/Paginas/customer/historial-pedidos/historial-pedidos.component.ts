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

  deliveryFeedbackSent: boolean = false;


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
          // Obtener estado del pedido (delivery)
          this.ordersService.getOrderDeliveryStatus(venta.id).subscribe({
            next: (deliveryData) => {
              venta.estado_pedido = deliveryData.status_display;
            },
            error: (err) => {
              venta.estado_pedido = 'Sin estado';
            }
          });
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

  // Feedback

  enviarFeedbackProducto(item: any): void {
    const payload = {
      order: this.ventaSeleccionada.id,
      product: item.product.id,
      product_rating: item.product._rating,
      product_comment: item.product._comment || 'Sin comentarios'
    };

    this.ordersService.rateProductFeedback(payload).subscribe({
      next: () => {
        item.product._feedbackSent = true;
        this.notificacionService.success('¡Gracias!', 'Feedback de producto enviado');
      },
      error: () => {
        this.notificacionService.error('Error', 'No se pudo enviar el feedback del producto');
      }
    });
  }

  enviarFeedbackDelivery(): void {
    const payload = {
      order: this.ventaSeleccionada.id,
      delivery_rating: this.valoracionEntrega,
      delivery_comment: this.comentarioEntrega || 'Sin comentarios'
    };

    this.ordersService.rateDeliveryFeedback(payload).subscribe({
      next: () => {
        this.deliveryFeedbackSent = true;
        this.notificacionService.success('¡Gracias!', 'Feedback de entrega enviado');
      },
      error: () => {
        this.notificacionService.error('Error', 'No se pudo enviar el feedback de entrega');
      }
    });
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

  abrirModalFeedback(venta: any): void {
    this.ventaSeleccionada = venta;
    this.modalFeedbackVisible = true;
    this.deliveryFeedbackSent = false;

    // Obtener feedbacks existentes para la orden
    this.ordersService.getOrderFeedback(1, 10).subscribe({
      next: (res: any) => {
        const feedbacks = res.items.filter((f: any) => f.order === venta.id);

        // Marcar productos con feedback existente
        this.ventaSeleccionada.items.forEach((item: any) => {
          const prodFeedback = feedbacks.find((f: any) => f.product === item.product.id);
          item.product._feedbackSent = !!prodFeedback;
          item.product._rating = prodFeedback?.product_rating || 0;
          item.product._comment = prodFeedback?.product_comment || '';
        });

        // Marcar feedback de entrega si existe
        const deliveryFb = feedbacks.find((f: any) => f.delivery_rating !== null);
        this.deliveryFeedbackSent = !!deliveryFb;
        this.valoracionEntrega = deliveryFb?.delivery_rating || 0;
        this.comentarioEntrega = deliveryFb?.delivery_comment || '';
      },
      error: () => {
        // Si hay error, deja los campos editables
        this.ventaSeleccionada.items.forEach((item: any) => {
          item.product._feedbackSent = false;
        });
        this.deliveryFeedbackSent = false;
      }
    });
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

}
