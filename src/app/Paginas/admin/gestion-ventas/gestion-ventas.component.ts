import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
import { AuthService } from '../../../services/auth.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown'; // Asegúrate de importar en el módulo
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../../services/notificacion.service';


@Component({
  selector: 'app-gestion-ventas',
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, DropdownModule,FormsModule],
  templateUrl: './gestion-ventas.component.html',
  styleUrl: './gestion-ventas.component.css'
})
export class GestionVentasComponent implements OnInit {
  ventas: any[] = [];
  usuarios: { [key: number]: any } = {}; // Mapeo de usuarios por ID
  ventaSeleccionada: any = null; // Venta seleccionada para el modal
  modalVerMasVisible: boolean = false; // Controla la visibilidad del modal

  // Propiedades para paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;

  //estado del pedido
  estadosPedido = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Procesando', value: 'processing' },
    { label: 'En reparto', value: 'out_for_delivery' },
    { label: 'Entregado', value: 'delivered' },
    { label: 'Fallido', value: 'failed' }
  ];
  
  modalEditarEstadoVisible = false;
  ventaEditandoEstado: any = null;
  nuevoEstadoPedido: string = '';

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.obtenerVentas();
  }

  obtenerVentas(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.ordersService.getVentas(page, pageSize).subscribe({
      next: (res: any) => {
        // this.ventas = res.items.filter(
        //   (venta: any) => venta.payment?.payment_status === 'completed'
        // );
        this.ventas = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
        
        console.log("Productos con stock:", this.ventas);
        console.log("respuesta del backend:", res);

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

  // Nuevo método para manejar el cambio de página
  onPageChange(event: any): void {
    // Si usas p-paginator de PrimeNG
    if (event.page !== undefined) {
      // PrimeNG paginator usa base 0 (primera página = 0)
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } 
    // Si usas p-table con paginación integrada
    else if (event.first !== undefined) {
      // Calcular página basado en first y rows
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    
    console.log(`Cambiando a página ${this.currentPage}, tamaño: ${this.pageSize}`);
    this.obtenerVentas(this.currentPage, this.pageSize);
  }

  getNombreUsuario(id: number): string {
    const usuario = this.usuarios[id];
    return usuario ? `${usuario.first_name} ${usuario.last_name}` : 'Cargando...';
  }

  //estado del pedido

  getEstadoPedidoDisplay(valor: string): string {
    const found = this.estadosPedido.find(e => e.value === valor);
    return found ? found.label : valor || 'Sin estado';
  }
  
  cambiarEstadoPedido() {
    if (!this.ventaEditandoEstado) return;
    console.log('Enviando PATCH:', { delivery_status: this.nuevoEstadoPedido }); // <-- Verifica aquí
    this.ordersService.patchOrderDeliveryStatus(
      this.ventaEditandoEstado.id,
      { delivery_status: this.nuevoEstadoPedido }
    ).subscribe({
      next: (res) => {
        this.ventaEditandoEstado.estado_pedido = this.nuevoEstadoPedido;
        this.notificacionService.success('Estado de pedido cambiado', 'el cambio se realizó correctamente');
        this.cerrarModalEditarEstado();
      },
      error: (err) => {
        this.notificacionService.error('Fallo al cambiar estado del pedido', 'el cambio no se realizó correctamente');
      }
    });
  }

  abrirModalEditarEstado(venta: any) {
    this.ventaEditandoEstado = venta;
    // Si el estado actual no está en la lista, selecciona null
    const existe = this.estadosPedido.some(e => e.value === venta.estado_pedido);
    this.nuevoEstadoPedido = existe ? venta.estado_pedido : null;
    this.modalEditarEstadoVisible = true;
  }
  
  cerrarModalEditarEstado() {
    this.modalEditarEstadoVisible = false;
    this.ventaEditandoEstado = null;
    this.nuevoEstadoPedido = '';
  }

  //Ver mas 

  abrirModalVerMas(venta: any): void {
    this.ventaSeleccionada = venta;
    this.modalVerMasVisible = true;
  }

  cerrarModalVerMas(): void {
    this.modalVerMasVisible = false;
    this.ventaSeleccionada = null;
  }
}