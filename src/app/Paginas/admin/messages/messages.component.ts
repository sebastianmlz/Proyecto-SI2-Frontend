import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { DialogModule } from 'primeng/dialog';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    RatingModule,
    FormsModule,
    HttpClientModule,
    DialogModule
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  feedbacks: any[] = [];
  feedbackSeleccionado: any = null;
  feedbackDetalle: any = null;
  usuarioDetalle: any = null; // Añadir esta variable
  modalVisible: boolean = false;

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.cargarFeedback();
  }

  cargarFeedback():void{
    this.ordersService.getOrderFeedback().subscribe({
      next: (res: any) => {
        const items = res.items || [];
        const agrupados: { [key: number]: any } = {};

        items.forEach((item: any) => {
          const orderId = item.order;

          // Inicializar si no existe
          if (!agrupados[orderId]) {
            agrupados[orderId] = {
              order: orderId,
              product_rating: item.product_rating,
              product_comment: item.product_comment,
              delivery_rating: item.delivery_rating ?? null,
              delivery_comment: item.delivery_comment ?? null,
              order_date: item.order_date || 'Fecha no disponible',
              user: item.user || null,
            };
          } else {
            // No sobreescribas si ya hay delivery_rating válido
            if (
              agrupados[orderId].delivery_comment == null &&
              item.delivery_comment
            ) {
              agrupados[orderId].delivery_comment = item.delivery_comment;
            }

            if (
              agrupados[orderId].delivery_rating == null &&
              item.delivery_rating != null
            ) {
              agrupados[orderId].delivery_rating = item.delivery_rating;
            }
          }
        });

        // Conversión a array
        this.feedbacks = Object.values(agrupados);
        console.log('Feedbacks procesados:', this.feedbacks);
      },
      error: (err) => {
        console.error('Error al obtener feedback:', err);
      }
    });
  }

  abrirModal(feedback: any) {
    this.modalVisible = true;
    console.log('Feedback seleccionado:', feedback);
  }

  cerrarModal() {
    this.modalVisible = false;
  }

  verDetalle(feedback: any): void {
    if (!feedback?.order) {
      console.error('No se pudo obtener el ID de la orden');
      return;
    }

    this.feedbackSeleccionado = feedback;
    this.feedbackDetalle = feedback;
    this.usuarioDetalle = null;
    this.modalVisible = true;

    // Obtener detalles adicionales de la orden
    this.ordersService.getOrderFeedbackById(feedback.order).subscribe({
      next: (res: any) => {
        console.log('Detalle recibido desde backend:', res);

        const firstItem = res.items?.length > 0 ? res.items[0] : null;

        if (firstItem) {
          // Unir los datos locales + backend
          this.feedbackDetalle = {
            ...feedback,
            ...firstItem,
            product_rating: feedback.product_rating || firstItem.product_rating,
            product_comment: feedback.product_comment || firstItem.product_comment,
            delivery_rating: feedback.delivery_rating || firstItem.delivery_rating,
            delivery_comment: feedback.delivery_comment || firstItem.delivery_comment,
            user: feedback.user || firstItem.user,
          };

          if (feedback.user) {
            this.authService.getUserById(feedback.user).subscribe({
              next: (usuario) => {
                console.log('Usuario obtenido:', usuario);
                this.usuarioDetalle = usuario;
              },
              error: (err) => {
                console.error('Error al obtener usuario:', err);
              }
            });
          } else {
            console.warn('No se encontró user_id para el feedback');
          }
        } else {
          console.warn('No se recibieron detalles del backend para esta orden');
        }
      },
      error: (err) => {
        console.error('Error al obtener detalle de feedback:', err);
      }
    });
  }
}



