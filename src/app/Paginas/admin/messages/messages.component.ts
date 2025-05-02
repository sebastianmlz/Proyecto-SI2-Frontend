import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { ProductosService } from '../../../services/productos.service';
import { DialogModule } from 'primeng/dialog';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    RatingModule,
    FormsModule,
    HttpClientModule,
    DialogModule,
    PaginatorModule,
    ButtonModule
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  feedbacks: any[] = [];
  feedbackSeleccionado: any = null;
  usuarioDetalle: any = null;
  modalVisible: boolean = false;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  loading: boolean = false;

  constructor(
    private ordersService: OrdersService,
    private productosService: ProductosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarFeedback();
  }

  cargarFeedback(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.ordersService.getOrderFeedback(1, 10).subscribe({ // Trae todos y pagina en frontend
      next: async (res: any) => {
        const items = res.items || [];
        const agrupados: { [orderId: number]: any } = {};

        for (const item of items) {
          const orderId = item.order;
          if (!agrupados[orderId]) {
            agrupados[orderId] = {
              order: orderId,
              user: item.user || null,
              user_name: item.user_name || 'Cliente',
              productos: [],
              delivery: null
            };
          }
          if (item.product) {
            let productName = 'Producto';
            try {
              const producto = await this.productosService.getProductoById(item.product).toPromise();
              if (producto && producto.name) productName = producto.name;
            } catch {}
            agrupados[orderId].productos.push({
              product_name: productName,
              product_rating: item.product_rating,
              product_comment: item.product_comment
            });
          }
          if (item.delivery_rating) {
            agrupados[orderId].delivery = {
              delivery_rating: item.delivery_rating,
              delivery_comment: item.delivery_comment
            };
          }
        }

        // Paginar agrupados
        const agrupadosArray = Object.values(agrupados).reverse();
        this.totalRecords = agrupadosArray.length;
        const start = (page - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.feedbacks = agrupadosArray.slice(start, end);

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    if (event.page !== undefined) {
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } else if (event.first !== undefined) {
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    this.cargarFeedback(this.currentPage, this.pageSize);
  }

  abrirModal(feedback: any) {
    this.feedbackSeleccionado = feedback;
    console.log("feedback seleccionado: ", feedback);
    this.modalVisible = true;
    this.usuarioDetalle = null;
    if (feedback.user) {
      this.authService.getUserById(feedback.user).subscribe({
        next: (usuario: any) => {
          this.usuarioDetalle = usuario;
        },
        error: (err) => {
          console.error('Error al obtener usuario', err);
        }
      });
    }
  }

  cerrarModal() {
    this.modalVisible = false;
    this.feedbackSeleccionado = null;
    this.usuarioDetalle = null;
  }
}