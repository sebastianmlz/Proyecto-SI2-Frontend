import { Component, OnInit } from '@angular/core';
import { reportsService } from '../../../services/reports.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule,NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';


@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    TableModule // si estás usando <p-table>
  ]
})

export class ReportesComponent implements OnInit {
  reportes: any[] = [];
  usuarios: { [key: number]: User } = {}; // Mapeo por ID de usuario

  modalCrearVisible: boolean = false;

  nuevoReporte = {
    name: '',
    report_type: '',
    language: '',
    format: ''
  };
  
  tiposReporte = [
    { label: 'Ventas por cliente', value: 'sales_by_customer' },
    { label: 'Productos más vendidos', value: 'best_sellers' },
    { label: 'Ventas por periodo (ultimo mes)', value: 'sales_by_period' },
    { label: 'Rendimiento de producto', value: 'product_performance' },
    { label: 'Estado de inventario', value: 'inventory_status' }
  ];
  
  idiomas = [
    { label: 'Español', value: 'es' },
    { label: 'Inglés', value: 'en' }
  ];
  
  formatos = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' }
  ];


  constructor(
    private reportsService: reportsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerReportes();
  }

  obtenerReportes(): void {
    this.reportsService.obtenerReportes().subscribe({
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
  

  getNombreUsuario(userId: number): string {
    const usuario = this.usuarios[userId];
    return usuario ? `${usuario.first_name} ${usuario.last_name}` : 'Cargando...';
  }

  abrirModalCrear() {
    this.modalCrearVisible = true;
  }
  
  cerrarModalCrear() {
    this.modalCrearVisible = false;
    this.nuevoReporte = {
      name: '',
      report_type: '',
      language: '',
      format: ''
    };
  }

  crearNuevoReporte() {
    this.reportsService.crearReporte(this.nuevoReporte).subscribe({
      next: (res) => {
        this.cerrarModalCrear();
        this.obtenerReportes(); // recargar la tabla
      },
      error: (err) => {
        console.error('Error al crear reporte:', err);
      }
    });
  }
}
