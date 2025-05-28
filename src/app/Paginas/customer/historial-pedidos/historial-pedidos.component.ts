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
import { reportsService } from '../../../services/reports.service';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';


@Component({
  selector: 'app-historial-pedidos',
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, RatingModule, FormsModule, DropdownModule, CalendarModule],
  templateUrl: './historial-pedidos.component.html',
  styleUrl: './historial-pedidos.component.css'
})
export class HistorialPedidosComponent implements OnInit {
  ventas: any[] = [];
  usuarios: { [key: number]: any } = {}; // Mapeo de usuarios por ID
  ventaSeleccionada: any = null; // Venta seleccionada para el modal
  modalVerMasVisible: boolean = false; // Controla la visibilidad del modal
  modalFeedbackVisible: boolean = false;
  reportes: any[] = [];
  nuevoReporte = {
    name: '',
    report_type: '',
    format: '',
    language: '',
    start_date: null as Date | null, // Añadir
    end_date: null as Date | null    // Añadir
  };

  Recibo = {
    name: '',
    report_type: 'order_receipt',
    format: '',
    language: ''
  }

  tiposReporte = [
    { label: 'Compras', value: 'my_orders' },
    { label: 'Recibo', value: 'order_receipt' }
  ];

  idiomas = [
    { label: 'Español', value: 'es' },
    { label: 'Inglés', value: 'en' }
  ];

  formatos = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'Html', value: 'html' }
  ];

  modalCrearReporteVisible: boolean = false; // Para el modal de creación
  modalReportesGeneradosVisible: boolean = false; // Para ver reportes generados

  // Variables para el feedback
  valoracionGeneral: number = 0;
  comentarioGeneral: string = '';
  valoracionProducto: number = 0;
  comentarioProducto: string = '';
  valoracionEntrega: number = 0;
  comentarioEntrega: string = '';
  deliveryFeedbackSent: boolean = false;

  // Agregar estas variables nuevas
  ordenSeleccionada: number | null = null;
  ordenesDisponibles: any[] = [];

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private reportesService: reportsService,
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
        console.log('Ventas obtenidas:', this.ventas);
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

  getDatosDelivery(orderId: number): any {
    if (!this.ventaSeleccionada || !this.ventaSeleccionada.delivery) {
      return {
        nombre: 'Sin información',
        estado: 'Sin información',
        fecha: 'Sin información',
        email: 'No disponible',
        vehiculo: 'No especificado'
      };
    }
    
    const delivery = this.ventaSeleccionada.delivery;
    
    // Datos del repartidor
    let nombreRepartidor = 'Sin asignar';
    if (delivery.assignment) {
      // Manejo específico cuando delivery_person es un objeto
      if (delivery.assignment.delivery_person && typeof delivery.assignment.delivery_person === 'object') {
        const person = delivery.assignment.delivery_person;
        
        // Verificamos si tiene la propiedad name
        if (person.name) {
          nombreRepartidor = person.name;
        } 
        // Si no tiene name pero tiene first_name y last_name
        else if (person.first_name && person.last_name) {
          nombreRepartidor = `${person.first_name} ${person.last_name}`;
        }
        // Si solo tiene first_name
        else if (person.first_name) {
          nombreRepartidor = person.first_name;
        }
        // Si no hay ninguno de estos datos
        else {
          nombreRepartidor = `Repartidor #${person.id || delivery.assignment.id}`;
        }
      } 
      // Cuando es una cadena de texto
      else if (typeof delivery.assignment.delivery_person === 'string') {
        nombreRepartidor = delivery.assignment.delivery_person;
      } 
      // Verificamos otras propiedades posibles
      else if (delivery.assignment.name) {
        nombreRepartidor = delivery.assignment.name;
      } else {
        nombreRepartidor = `Repartidor #${delivery.assignment.id}`;
      }
    }

    // Email del repartidor
    let emailRepartidor = 'No disponible';
    if (delivery.assignment && delivery.assignment.delivery_person) {
      // Si delivery_person es un objeto con propiedad email
      if (typeof delivery.assignment.delivery_person === 'object' && delivery.assignment.delivery_person.email) {
        emailRepartidor = delivery.assignment.delivery_person.email;
      } 
      // Si hay una propiedad directa delivery_person_email
      else if (delivery.assignment.delivery_person_email) {
        emailRepartidor = delivery.assignment.delivery_person_email;
      }
    }

    // Tipo de vehículo
    let tipoVehiculo = 'No especificado';
    // Revisar si existe un perfil con tipo de vehículo
    if (delivery.assignment && 
        delivery.assignment.delivery_person && 
        typeof delivery.assignment.delivery_person === 'object' &&
        delivery.assignment.delivery_person.profile &&
        delivery.assignment.delivery_person.profile.vehicle_type) {
      tipoVehiculo = delivery.assignment.delivery_person.profile.vehicle_type;
    } 
    // Caso alternativo donde el vehicle_type está directamente en el assignment
    else if (delivery.assignment && delivery.assignment.vehicle_type) {
      tipoVehiculo = delivery.assignment.vehicle_type;
    }
    
    return {
      nombre: nombreRepartidor,
      estado: delivery.status_display || delivery.status || 'Pendiente',
      fecha: delivery.assignment?.assignment_date || 'Sin fecha asignada',
      email: emailRepartidor,
      vehiculo: tipoVehiculo
    };
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

  obtenerReportes(): void {
    this.reportesService.obtenerReportes().subscribe({
      next: (res: any) => {
        console.log("Reportes obtenidos:", res);
        // ✅ Filtrar solo los reportes con file_path válido
        this.reportes = res.items.filter((reporte: any) => reporte.file_path !== null);

        // Obtener los nombres de usuario asociados a cada reporte
        this.reportes.forEach((reporte: any) => {
          const userId = reporte.user;
          if (!this.usuarios[userId]) {
            this.authService.getUserById(userId).subscribe({
              next: (usuario: any) => {
                this.usuarios[userId] = usuario;
              },
              error: (err) => {
                console.error("Error al obtener usuario:", err);
              }
            });
          }
        });
      },
      error: (err) => {
        console.error("Error al cargar reportes:", err);
      }
    });
  }

  crearNuevoReporte(): void {
    if (this.nuevoReporte.report_type === 'order_receipt' && !this.ordenSeleccionada) {
      this.notificacionService.warn('Selecciona una orden', 'Debes seleccionar una orden para generar el recibo');
      return;
    }

    // Validar fechas para 'my_orders'
    if (this.nuevoReporte.report_type === 'my_orders' && (!this.nuevoReporte.start_date || !this.nuevoReporte.end_date)) {
      this.notificacionService.warn('Fechas requeridas', 'Debes seleccionar fecha de inicio y fin para este reporte.');
      return;
    }

    let payload: any;

    if (this.nuevoReporte.report_type === 'order_receipt') {
      payload = {
        name: this.nuevoReporte.name,
        report_type: 'order_receipt',
        format: this.nuevoReporte.format,
        language: this.nuevoReporte.language,
        order_id: this.ordenSeleccionada
      };
    } else if (this.nuevoReporte.report_type === 'my_orders') {
      payload = {
        name: this.nuevoReporte.name,
        report_type: 'my_orders',
        format: this.nuevoReporte.format,
        language: this.nuevoReporte.language,
        start_date: this.nuevoReporte.start_date, // Incluir fechas
        end_date: this.nuevoReporte.end_date     // Incluir fechas
      };
    } else {
      // Para otros tipos de reportes que no sean recibo ni mis_ordenes (si los hubiera)
      payload = { ...this.nuevoReporte };
      delete payload.start_date; // Eliminar si no son necesarios
      delete payload.end_date;
    }

    this.reportesService.crearReporte(payload).subscribe({
      next: (res: any) => {
        const mensaje = this.nuevoReporte.report_type === 'order_receipt'
          ? 'Recibo generado con éxito'
          : 'Reporte creado con éxito';

        this.notificacionService.success('¡Listo!', mensaje);
        this.cerrarModalCrear();
        // Mostrar los reportes generados después de crear uno nuevo
        this.abrirModalReportesGenerados();
      },
      error: (err) => {
        console.error('Error al crear reporte/recibo:', err);
        this.notificacionService.error('Error', 'No se pudo generar el documento');
      }
    });
  }

  abrirModalCrear(): void {
    // Reset the form values
    const hoy = new Date();
    const unMesAtras = new Date();
    unMesAtras.setMonth(hoy.getMonth() - 1);

    this.nuevoReporte = {
      name: '',
      report_type: '',
      language: '',
      format: '',
      start_date: unMesAtras, // Fecha por defecto
      end_date: hoy         // Fecha por defecto
    };

    // Cargar órdenes disponibles para el selector de recibos
    this.ordenesDisponibles = this.ventas.map(venta => ({
      label: `Pedido #${venta.id} - ${new Date(venta.created_at).toLocaleDateString()}`,
      value: venta.id
    }));

    this.ordenSeleccionada = null;
    this.modalCrearReporteVisible = true;
  }

  cerrarModalCrear(): void {
    this.modalCrearReporteVisible = false;
  }

  abrirModalReportesGenerados(): void {
    this.obtenerReportes();
    this.modalReportesGeneradosVisible = true;
  }

  cerrarModalReportesGenerados(): void {
    this.modalReportesGeneradosVisible = false;
  }

  // Agregamos un método para manejar el cambio de tipo de reporte
  onReportTypeChange(): void {
    if (this.nuevoReporte.report_type === 'order_receipt') {
      this.nuevoReporte.name = 'Recibo de mi pedido';
    } else if (this.nuevoReporte.report_type === 'my_orders') {
      this.nuevoReporte.name = 'Mis Compras'; // O un nombre por defecto
      // Asegurar que las fechas por defecto se establezcan si no están ya
      if (!this.nuevoReporte.start_date || !this.nuevoReporte.end_date) {
        const hoy = new Date();
        const unMesAtras = new Date();
        unMesAtras.setMonth(hoy.getMonth() - 1);
        this.nuevoReporte.start_date = unMesAtras;
        this.nuevoReporte.end_date = hoy;
      }
    } else {
      this.nuevoReporte.name = '';
    }
  }
}
