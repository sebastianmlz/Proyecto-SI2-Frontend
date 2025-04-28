import { Component, OnInit } from '@angular/core';
import { LogsService } from '../../../services/logs.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule
  ],
  templateUrl: './bitacora.component.html',
})
export class BitacoraComponent implements OnInit {
  logs: any[] = [];
  logSeleccionado: any = null;
  usuarioDetalle: any = null;
  modalVisible: boolean = false;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;

  constructor(
    private logsService: LogsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarBitacora(this.currentPage, this.pageSize);
  }

  cargarBitacora(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.logsService.obtenerBitacora(page, pageSize).subscribe({
      next: (res) => {
        this.logs = (res.items || []); // Más recientes primero
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener bitácora:', err);
        this.loading = false;
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
    this.cargarBitacora(this.currentPage, this.pageSize);
  }

  abrirModalDetalle(log: any): void {
    this.logSeleccionado = log;
    this.modalVisible = true;
    console.log("log seleccionado:", log);
    if (log.user) {
      this.authService.getUserById(log.user).subscribe({
        next: (usuario: any) => {
          this.usuarioDetalle = usuario;
        },
        error: (err) => {
          console.error('Error al obtener usuario', err);
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.logSeleccionado = null;
    this.usuarioDetalle = null;
  }
}
