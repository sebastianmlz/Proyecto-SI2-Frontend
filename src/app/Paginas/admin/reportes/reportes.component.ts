import { Component, OnInit } from '@angular/core';
import { reportsService } from '../../../services/reports.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

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
    TableModule, // Eliminé la duplicación
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
  ]
})

export class ReportesComponent implements OnInit {
  reportes: any[] = [];
  usuarios: { [key: number]: User } = {}; // Mapeo por ID de usuario

  modalCrearVisible: boolean = false;

  // Corregida la tipificación del objeto
  nuevoReporte: {
    name: string;
    report_type: string;
    language: string;
    format: string;
    start_date: Date | null;
    end_date: Date | null;
  } = {
    name: '',
    report_type: '',
    language: '',
    format: '',
    start_date: null,
    end_date: null
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

  mostrarAlertaFechas: boolean = false;

  // Lista de tipos de reportes que requieren fechas
  tiposConFechas: string[] = ['sales_by_period', 'product_performance'];

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
        // Verificar que res tiene la estructura esperada
        if (res && res.items) {
          console.log("Reportes obtenidos:", res);
          // Filtrar solo los reportes con file_path válido
          this.reportes = res.items.filter((reporte: any) => reporte.file_path !== null);
    
          // Obtener los nombres de usuario asociados a cada reporte
          this.reportes.forEach((reporte: any) => {
            const userId = reporte.user;
            if (userId && !this.usuarios[userId]) {
              this.authService.getUserById(userId).subscribe({
                next: (usuario: any) => {
                  if (usuario) {
                    this.usuarios[userId] = usuario;
                  }
                },
                error: (err) => {
                  console.error("Error al obtener usuario:", err);
                }
              });
            }
          });
        } else {
          console.error("La respuesta del API no tiene la estructura esperada:", res);
        }
      },
      error: (err) => {
        console.error("Error al cargar reportes:", err);
      }
    });
  }
  
  getNombreUsuario(userId: number): string {
    if (!userId) return 'Usuario desconocido';
    const usuario = this.usuarios[userId];
    if (!usuario) return 'Cargando...';
    
    // Validar que los campos existan antes de usarlos
    const firstName = usuario.first_name || '';
    const lastName = usuario.last_name || '';
    return `${firstName} ${lastName}`.trim() || usuario.username || 'Sin nombre';
  }

  abrirModalCrear(): void {
    // Resetear el formulario al abrir
    this.nuevoReporte = {
      name: '',
      report_type: '',
      language: '',
      format: '',
      start_date: null,
      end_date: null
    };
    this.mostrarAlertaFechas = false;
    this.modalCrearVisible = true;
  }
  
  cerrarModalCrear(): void {
    this.modalCrearVisible = false;
  }

  // Método añadido para responder al cambio en el tipo de reporte
  onReportTypeChange(): void {
    // Verificar si el tipo seleccionado requiere fechas
    const requiereFechas = this.tiposConFechas.includes(this.nuevoReporte.report_type);
    
    // Si no requiere fechas, limpiar los campos de fecha
    if (!requiereFechas) {
      this.nuevoReporte.start_date = null;
      this.nuevoReporte.end_date = null;
    } else {
      // Si requiere fechas, establecer fechas predeterminadas útiles
      const hoy = new Date();
      // Por defecto, último mes
      const unMesAtras = new Date();
      unMesAtras.setMonth(hoy.getMonth() - 1);
      
      this.nuevoReporte.end_date = hoy;
      this.nuevoReporte.start_date = unMesAtras;
    }
    
    this.verificarFechas();
  }

  crearNuevoReporte(): void {
    if (!this.esFormularioValido()) {
      this.verificarFechas(); // Mostrar alertas si es necesario
      return;
    }
    
    // Crea una copia para no modificar el original
    const payload: any = {
      name: this.nuevoReporte.name,
      report_type: this.nuevoReporte.report_type,
      language: this.nuevoReporte.language,
      format: this.nuevoReporte.format
    };
  
    if (this.tiposConFechas.includes(this.nuevoReporte.report_type)) {
      if (this.nuevoReporte.start_date) {
        payload.start_date = this.formatearFecha(this.nuevoReporte.start_date);
      }
      if (this.nuevoReporte.end_date) {
        payload.end_date = this.formatearFecha(this.nuevoReporte.end_date);
      }
    }    
    this.reportsService.crearReporte(payload).subscribe({
      next: (res) => {
        console.log("Reporte creado exitosamente:", res);
        this.cerrarModalCrear();
        setTimeout(() => {
          this.obtenerReportes(); // recargar la tabla después de un breve retraso
        }, 1000); // Dar tiempo al backend para procesar el reporte
      },
      error: (err) => {
        console.error('Error al crear reporte:', err);
        // Aquí podrías añadir una notificación de error
      }
    });
  }
  
  // Método auxiliar para formatear fechas a formato ISO (mejorado)
  private formatearFecha(fecha: Date | string | null): string | null {
    if (!fecha) return null;
  
    const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida:', fecha);
      return null;
    }
  
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`; // ✅ Correcto formato
  }

  // Método para verificar fechas (mejorado)
  verificarFechas(): void {
    // Verifica si el tipo de reporte seleccionado requiere fechas
    const requiereFechas = this.tiposConFechas.includes(this.nuevoReporte.report_type);
    
    // Muestra alerta si se requieren fechas y alguna está vacía
    this.mostrarAlertaFechas = requiereFechas && 
      (!this.nuevoReporte.start_date || !this.nuevoReporte.end_date);
  }

  // Método para validar el formulario (mejorado)
  esFormularioValido(): boolean {
    // Campos básicos obligatorios para cualquier tipo de reporte
    const camposBasicosValidos = 
      this.nuevoReporte.name && 
      this.nuevoReporte.report_type && 
      this.nuevoReporte.language &&
      this.nuevoReporte.format;
    
    if (!camposBasicosValidos) return false;
    
    // Validación específica para reportes que requieren fechas
    if (this.tiposConFechas.includes(this.nuevoReporte.report_type)) {
      if (!this.nuevoReporte.start_date || !this.nuevoReporte.end_date) {
        this.mostrarAlertaFechas = true;
        return false;
      }
      
      // Verificar que la fecha de inicio sea anterior a la fecha de fin
      if (this.nuevoReporte.start_date > this.nuevoReporte.end_date) {
        // Podrías mostrar otra alerta específica para este error
        return false;
      }
    }
    
    return true;
  }
}
