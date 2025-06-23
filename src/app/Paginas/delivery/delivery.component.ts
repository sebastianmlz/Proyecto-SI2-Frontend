import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { DeliveryService } from '../../services/delivery.service';
import { DeliveryAssignment, DeliveryAssignmentResponse } from '../../models/delivery-assignment.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    CardModule,
    TabViewModule,
    TagModule,
    ProgressBarModule,
    TooltipModule,
    BadgeModule,
    DividerModule,
    SkeletonModule,
    FormsModule
  ],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnInit {
  usuario: any;
  assignments: DeliveryAssignment[] = [];
  filteredAssignments: DeliveryAssignment[] = [];
  selectedAssignment: DeliveryAssignment | null = null;
  loading = false;
  currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  pageSize = 10;
  activeFilter = 'all'; // 'all', 'pending', 'completed'
  detailsModalVisible = false;
  startDeliveryConfirmModalVisible = false;
  completeDeliveryConfirmModalVisible = false;
  
  // Estadísticas
  completedCount = 0;
  pendingCount = 0;
  
  constructor(
    public authService: AuthService,
    private noti: NotificacionService,
    private deliveryService: DeliveryService
  ) { }

  ngOnInit() {
    this.usuario = this.authService.getUser();
    this.noti.success(`Bienvenido ${this.usuario.first_name} ${this.usuario.last_name}`, 'Sesión iniciada con éxito');
    this.loadAssignments();
  }

  loadAssignments(page: number = 1) {
    this.loading = true;
    this.deliveryService.getMyAssignmentss(page, this.pageSize).subscribe({
      next: (response: DeliveryAssignmentResponse) => {
        this.assignments = response.items;
        this.totalItems = response.total;
        this.totalPages = response.pages;
        this.currentPage = response.page;
        this.calculateStats();
        this.applyFilter(this.activeFilter);
        this.loading = false;
      },
      error: (error) => {
        this.noti.error('No se pudieron cargar las asignaciones', 'Error');
        console.error('Error cargando asignaciones:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.completedCount = this.assignments.filter(a => a.status === 'completed').length;
    this.pendingCount = this.assignments.filter(a => a.status !== 'completed').length;
  }

  applyFilter(filter: string) {
    this.activeFilter = filter;
    switch (filter) {
      case 'completed':
        this.filteredAssignments = this.assignments.filter(a => a.status === 'completed');
        break;
      case 'pending':
        this.filteredAssignments = this.assignments.filter(a => a.status !== 'completed');
        break;
      default:
        this.filteredAssignments = [...this.assignments];
    }
  }

  openDetailsModal(assignment: DeliveryAssignment) {
    this.selectedAssignment = assignment;
    this.detailsModalVisible = true;
  }

  startDelivery(assignment: DeliveryAssignment) {
    this.selectedAssignment = assignment;
    this.startDeliveryConfirmModalVisible = true;
  }

  confirmStartDelivery() {
    if (!this.selectedAssignment) return;
    
    this.deliveryService.EmpezarPedido(this.selectedAssignment.id).subscribe({
      next: (response) => {
        this.noti.success('Entrega iniciada correctamente', 'Éxito');
        this.loadAssignments(this.currentPage);
        this.startDeliveryConfirmModalVisible = false;
      },
      error: (error) => {
        this.noti.error('No se pudo iniciar la entrega', 'Error');
        console.error('Error al iniciar entrega:', error);
      }
    });
  }

  completeDelivery(assignment: DeliveryAssignment) {
    this.selectedAssignment = assignment;
    this.completeDeliveryConfirmModalVisible = true;
  }

  confirmCompleteDelivery() {
    if (!this.selectedAssignment) return;
    
    this.deliveryService.CompletarPedido(this.selectedAssignment.id).subscribe({
      next: (response) => {
        this.noti.success('Entrega completada correctamente', 'Éxito');
        this.loadAssignments(this.currentPage);
        this.completeDeliveryConfirmModalVisible = false;
      },
      error: (error) => {
        this.noti.error('No se pudo completar la entrega', 'Error');
        console.error('Error al completar entrega:', error);
      }
    });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.loadAssignments(newPage);
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'pi pi-check-circle';
      case 'in_progress':
        return 'pi pi-car';
      case 'assigned':
        return 'pi pi-inbox';
      default:
        return 'pi pi-question-circle';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En progreso';
      case 'assigned':
        return 'Asignado';
      default:
        return status;
    }
  }

  // Calcular el porcentaje de progreso de una entrega
  calculateProgress(assignment: DeliveryAssignment): number {
    if (assignment.status === 'completed') return 100;
    if (assignment.status === 'in_progress') return 50;
    return 0;
  }
}
