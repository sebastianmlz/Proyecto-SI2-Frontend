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
  usuarios: { [key: number]: any } = {};
  logSeleccionado: any = null;
  usuarioDetalle: any = null;
  modalVisible: boolean = false;

  constructor(
    private logsService: LogsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerLogs();
  }

  obtenerLogs(): void {
    this.logsService.obtenerBitacora().subscribe({
      next: (res: any[]) => {
        console.log("Logs recibidos:", res);
        this.logs = res.reverse(); // 👈 Mostrar del más reciente al más antiguo
      },
      error: (err) => {
        console.error('Error al obtener bitácora:', err);
      }
    });
  }
  

  abrirModalDetalle(log: any): void {
    this.logSeleccionado = log;
    this.modalVisible = true;

    if (log.user_id) {
      this.authService.getUserById(log.user_id).subscribe({
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
