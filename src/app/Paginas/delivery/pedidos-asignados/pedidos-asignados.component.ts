import { Component, OnInit } from '@angular/core';
import { DeliveryService } from '../../../services/delivery.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-pedidos-asignados',
  standalone: true,
  imports: [CommonModule, TableModule, DialogModule, ButtonModule, FormsModule, DropdownModule],
  templateUrl: './pedidos-asignados.component.html',
  styleUrl: './pedidos-asignados.component.css'
})

export class PedidosAsignadosComponent implements OnInit {
  MyAssignments: any[] = [];
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  loading = false;
  modalVisible = false;
  pedidoSeleccionado: any = null;
  modalEditarEstadoVisible = false;
  nuevoEstadoPedido: string = '';
  estadosPedido = [
    { label: 'En Progreso', value: 'in_progress' },
    { label: 'Empezar', value: 'started' },
    { label: 'Completado', value: 'completed' } // Asegúrate de que este estado sea válido en tu backend
  ];
  ordenEditandoEstado: any = null;

  constructor(
    private deliveryService: DeliveryService,
    private ordersService: OrdersService,
    private notificacionService: NotificacionService
  ) { }

  ngOnInit() {
    this.cargarPedidosAsignados();
  }

  cargarPedidosAsignados() {
    this.loading = true;
    this.deliveryService.getMyAssignments(this.page, this.pageSize).subscribe({
      next: (response) => {
        this.MyAssignments = response.items || [];
        this.totalRecords = response.count;
        console.log('Pedidos asignados cargados:', this.MyAssignments);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar los pedidos asignados:', error);
        this.loading = false;
      }
    });
  }

  cerrarModalEditarEstado() {
    this.modalEditarEstadoVisible = false;
    this.ordenEditandoEstado = null;
    this.nuevoEstadoPedido = '';
  }

  cambiarEstado(pedido: any, nuevoEstado: string) {
    this.ordenEditandoEstado = pedido;
    this.nuevoEstadoPedido = nuevoEstado;
    this.modalEditarEstadoVisible = true;
  }

  // Método para iniciar el pedido
  iniciarPedido(pedido: any) {
    this.deliveryService.EmpezarPedido(pedido.id).subscribe({
      next: (response) => {
        console.log('Pedido iniciado correctamente:', response);
        this.notificacionService.success('Pedido iniciado correctamente', 'Pedido iniciado');
        this.cargarPedidosAsignados();
      },
      error: (error) => {
        console.error('Error al iniciar el pedido:', error);
        this.notificacionService.error('Error al iniciar el pedido', 'Error');
        this.notificacionService.info('Asegúrese de que el administrador cambie el estado del pedido a "En Progreso"', 'Información');
      }
    });
  }

  // Método para completar el pedido directamente
  completarPedido(pedido: any) {
    this.deliveryService.CompletarPedido(pedido.id).subscribe({
      next: (response) => {
        console.log('Pedido completado correctamente:', response);
        this.notificacionService.success('Pedido completado correctamente', 'Éxito');
        this.cargarPedidosAsignados();
      },
      error: (error) => {
        console.error('Error al completar el pedido:', error);
        this.notificacionService.error('Error al completar el pedido', 'Error');
      }
    });
  }

  // Método para confirmar el cambio de estado
  confirmarCambioEstado() {
    if (this.ordenEditandoEstado && this.nuevoEstadoPedido) {
      // Solo permitimos cambiar de "assigned" a "in_progress" usando PATCH
      if (this.ordenEditandoEstado.status === 'assigned' && this.nuevoEstadoPedido === 'in_progress') {
        this.deliveryService.patchEstadoPedido(this.ordenEditandoEstado.id, this.nuevoEstadoPedido).subscribe({
          next: (response) => {
            this.notificacionService.success('Pedido en progreso', 'Estado actualizado correctamente');
            this.cerrarModalEditarEstado();
            this.cargarPedidosAsignados();
          },
          error: (error) => {
            console.error('Error al actualizar el estado del pedido:', error);
            this.notificacionService.error('Error al actualizar el estado', 'No se pudo cambiar el estado');
          }
        });
      } else {
        this.notificacionService.error('Operación no permitida', 'Solo se puede cambiar de Asignado a En Progreso');
      }
    } else {
      this.notificacionService.error('Debe seleccionar un estado válido', 'Error');
    }
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.cargarPedidosAsignados();
  }

  abrirModalDetalle(pedido: any) {
    this.pedidoSeleccionado = pedido;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.pedidoSeleccionado = null;
  }

  // Método para abrir el modal de editar estado
  abrirModalEditarEstado(pedido: any) {
    this.ordenEditandoEstado = pedido;
    if (pedido.status === 'assigned') {
      this.nuevoEstadoPedido = 'in_progress';
      // Solo mostramos la opción de En Progreso
      this.estadosPedido = [
        { label: 'En Progreso', value: 'in_progress' }
      ];
      this.modalEditarEstadoVisible = true;
    } else {
      // Si no está en assigned, mostramos un mensaje
      this.notificacionService.info(
        'Este pedido ya no está en estado Asignado',
        'Usa los botones de Iniciar o Completar'
      );
    }
  }
}
