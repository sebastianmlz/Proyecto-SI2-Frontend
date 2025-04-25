import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { OrdersService } from '../../../services/orders.service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';



@Component({
  selector: 'app-carrito',
  imports: [CommonModule,FormsModule, ButtonModule, InputTextModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {

  carrito: any[] = [];
  totalPagar: number = 0;

  ordenActivaId: number | null = null;
  editedItems: { [id: number]: boolean } = {}; // controlamos qué item fue editado


    constructor(
      // private productosService: ProductosService,
      private authService: AuthService,
      private ordersService: OrdersService,
      private noti: NotificacionService,
      private router: ActivatedRoute // 👈 agrega esto

    ) {}


    ngOnInit(): void {
      const pagoExitoso = this.router.snapshot.queryParamMap.get('payment') === 'success';
      const ordenPendiente = localStorage.getItem('pendingOrder');
    
      if (pagoExitoso && ordenPendiente) {
        localStorage.removeItem('pendingOrder');
        this.carrito = [];
        this.totalPagar = 0;
        this.noti.success('Pago exitoso', 'Tu compra fue procesada correctamente');
        return;
      }
    
      // Obtener última orden activa del backend
      this.ordersService.getVentas().subscribe({
        next: (res: any) => {
          const ordenes = res.items;
          if (ordenes.length === 0) return;
    
          const ultimaOrden = ordenes[0]; // orden más reciente
          this.ordenActivaId = ultimaOrden.id;
          console.log("ultima orden: ",ultimaOrden);
          const estadoPago = ultimaOrden.payment?.payment_status;
    
          if (estadoPago !== 'completed') {
            // Si no está completada, usar esta orden

            this.carrito = ultimaOrden.items.map((item: any) => ({
              id: item.product.id,
              name: item.product.name,
              price_usd: item.product.price_usd,
              quantity: item.quantity,
              image_url: item.product.image_url,
              order_item_id: item.id // para luego usarlo en el PATCH
            }));
            this.calcularTotal();
            console.log('Última orden activa cargada:', this.carrito);
          } else {
            // Si está completada, no mostrar carrito
            this.carrito = [];
            this.totalPagar = 0;
            console.log('La última orden ya está completada');
          }
        },
        error: (err) => {
          console.error('Error al cargar órdenes:', err);
        }
      });
    }
    
    guardarCantidad(item: any): void {
      if (!item.order_item_id || item.quantity <= 0) {
        this.noti.warn('Cantidad inválida', 'No se puede actualizar');
        return;
      }
    
      const data = { quantity: item.quantity };
      this.ordersService.patchOrderItem(item.order_item_id, data).subscribe({
        next: () => {
          this.noti.success('Cantidad actualizada', 'El producto fue actualizado');
          this.editedItems[item.id] = false; // ocultar botón
          this.calcularTotal();
        },
        error: (err) => {
          console.error('Error al actualizar cantidad:', err);
          this.noti.error('Error', 'No se pudo actualizar la cantidad');
        }
      });
    }

    marcarComoEditado(itemId: number): void {
      this.editedItems[itemId] = true;
    }

    eliminarItemBackend(item: any): void {
      if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
        const orderItemId = item.order_item_id; // asegurate que este campo exista
        if (!orderItemId) {
          this.noti.error('Error', 'No se encontró el ID del item para eliminar');
          return;
        }
    
        this.ordersService.eliminarOrderItem(orderItemId).subscribe({
          next: () => {
            // Eliminar del array del frontend también
            this.carrito = this.carrito.filter(i => i.order_item_id !== orderItemId);
            this.noti.success('Producto eliminado', 'El producto fue eliminado del carrito');
            this.calcularTotal();
          },
          error: (err) => {
            console.error('Error al eliminar el producto:', err);
            this.noti.error('Error', 'No se pudo eliminar el producto');
          }
        });
      }
    }
    

    ordenar(): void {
      const orderId = this.ordenActivaId;
      console.log('orden activa:', orderId);
    
      if (!orderId) {
        this.noti.error('Error', 'No se encontró una orden activa para continuar con el pago');
        return;
      }
    
      this.ordersService.createStripeCheckout(orderId).subscribe({
        next: (res: any) => {
          if (res.checkout_url) {
            localStorage.setItem('pendingOrder', String(orderId));
            window.location.href = res.checkout_url;
          } else {
            this.noti.error('Error', 'No se recibió la URL de Stripe');
          }
        },
        error: (err) => {
          console.error('Error al generar el checkout:', err);
          this.noti.error('Error', 'No se pudo generar el checkout');
        }
      });
    }
    
    
    
    

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }


  calcularTotal(): void {
    this.totalPagar = this.carrito.reduce((acc, item) =>
      acc + (item.price_usd * item.quantity), 0);
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }
  

  eliminarItem(item: any): void {
    this.carrito = this.carrito.filter(i => i.id !== item.id);
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
    this.calcularTotal();
  }


  realizarCompra(): void {
    const user = this.authService.getUser();
  
    const dataFinance = {
      currency: 'USD',
      items: this.carrito.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };
  
    this.ordersService.createFinance(dataFinance).subscribe({
      next: (orden: any) => {
        const orderId = orden.id;
        console.log('Orden creada con éxito:', orden);
        this.noti.success('Compra realizada', 'Tu pedido fue registrado correctamente');
  
        // 1. Preparar los items solo con lo necesario
        const itemsData = this.carrito.map((item: any) => ({
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity
        }));
  
        // 2. Enviar cada item
        const requests = itemsData.map((itemData: any) => 
          this.ordersService.createOrderItem(itemData)
        );
  
        // 3. Esperar a que todos los items se registren
        forkJoin(requests).subscribe({
          next: () => {
            this.noti.success('Productos Registrados a la orden', 'Tus productos fueron registradoa correctamente');
            // 4. Lanzar la pasarela de pago Stripe
            this.ordersService.createStripeCheckout(orderId).subscribe({
              next: (res: any) => {
                if (res.checkout_url) {
                  // Guardar que hay un pago pendiente
                  localStorage.setItem('pendingOrder', String(orderId));
                  // Redirigir a Stripe
                  window.location.href = res.checkout_url;
                } else {
                  this.noti.error('Error', 'No se recibió URL de Stripe');
                }
              },
              error: (err) => {
                console.error('Error al iniciar pago:', err);
                this.noti.error('Pago', 'No se pudo iniciar el pago');
              }
            });
          },
          error: (err) => {
            console.error('Error al registrar items:', err);
            this.noti.error('Error', 'No se pudieron registrar los productos');
          }
        });
      },
      error: (err) => {
        console.error('Error al crear orden:', err);
        this.noti.error('Error', 'No se pudo crear la orden');
      }
    });
  }
  
    

  // crearItems(ordenId: number): void {
  //   const items = this.carrito.map((item: any) => ({
  //     order: ordenId,
  //     product: item.id,
  //     quantity: item.quantity,
  //     unit_price: item.price_usd
  //   }));
  
  //   this.ordersService.createOrderItem(items).subscribe({
  //     next: () => {
  //       this.crearPago(ordenId);
  //     },
  //     error: (err) => {
  //       console.error('Error al crear ítems:', err);
  //       this.noti.error('Error', 'No se pudieron registrar los productos');
  //     }
  //   });
  // }

  // crearPago(ordenId: number): void {
  //   const payment = {
  //     order: ordenId,
  //     amount: this.totalPagar,
  //     method: 'Efectivo',
  //     status: 'Pendiente',
  //     transaction_id: 'trans' + Date.now()
  //   };
  
  //   this.ordersService.createPayment(payment).subscribe({
  //     next: () => {
  //       this.crearEntrega(ordenId);
  //     },
  //     error: (err) => {
  //       console.error('Error al registrar el pago:', err);
  //       this.noti.error('Error', 'No se pudo registrar el pago');
  //     }
  //   });
  // }

  // crearEntrega(ordenId: number): void {
  //   const delivery = {
  //     order: ordenId,
  //     delivery_address: 'Santa Cruz, Bolivia',
  //     delivery_status: 'Pendiente',
  //     tracking_info: 'En preparación',
  //     estimated_arrival: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString()
  //   };
  
  //   this.ordersService.createDelivery(delivery).subscribe({
  //     next: () => {
  //       this.noti.success('Compra realizada', 'Tu pedido fue registrado correctamente');
  //       localStorage.removeItem('carrito');
  //       this.carrito = [];
  //       this.totalPagar = 0;
  //     },
  //     error: (err) => {
  //       console.error('Error al registrar la entrega:', err);
  //       this.noti.error('Error', 'No se pudo registrar la entrega');
  //     }
  //   });
  // }
  
  
  
  
  

}
