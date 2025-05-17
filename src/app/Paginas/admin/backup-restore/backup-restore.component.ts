import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DatePipe } from '@angular/common'; // Importar DatePipe
import { BackupRestoreService } from '../../../services/backup-restore.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { BackupFile } from '../../../models/backup.model'; // Importar el modelo

@Component({
  selector: 'app-backup-restore',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, DatePipe], // Añadir DatePipe a imports
  templateUrl: './backup-restore.component.html',
  styleUrls: ['./backup-restore.component.css']
})
export class BackupRestoreComponent implements OnInit {
  availableBackups: BackupFile[] = []; // interfaz de backups
  selectedFile: File | null = null;

  creatingBackup: boolean = false;
  loadingBackups: boolean = false;
  restoringBackup: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private backupService: BackupRestoreService,
    private notificacionService: NotificacionService
  ) { }

  ngOnInit(): void {
    this.loadAvailableBackups();
  }

  loadAvailableBackups(): void {
    this.loadingBackups = true;
    this.backupService.listBackups().subscribe({
      next: (response) => {
        this.availableBackups = response.backups || [];
        this.loadingBackups = false;
      },
      error: (err) => {
        console.error('Error al listar backups:', err);
        this.notificacionService.error('Error', 'No se pudieron cargar los backups disponibles.');
        this.loadingBackups = false;
      }
    });
  }

  onCreateBackup(): void {
    this.creatingBackup = true;
    this.backupService.createBackup().subscribe({
      next: (response) => {
        // Asumimos que la respuesta de creación podría incluir el nuevo backup o un mensaje.
        // Si devuelve el nuevo objeto BackupFile:
        // if (response.backup) {
        //   this.availableBackups.unshift(response.backup); // Añadir al inicio de la lista
        // }
        this.notificacionService.success('Backup Creado', response.message || 'El proceso de backup ha comenzado.');
        setTimeout(() => this.loadAvailableBackups(), 3000); // Dar tiempo a S3
        this.creatingBackup = false;
      },
      error: (err) => {
        console.error('Error al crear backup:', err);
        this.notificacionService.error('Error', 'No se pudo iniciar el proceso de backup.');
        this.creatingBackup = false;
      }
    });
  }

  // Modificamos onDownloadBackup para usar el objeto BackupFile completo
  onDownloadBackup(backup: BackupFile): void {
    this.notificacionService.info('Descargando...', `Preparando la descarga de ${backup.filename}`);
    
    // Decidir si usar la download_url o construirla:
    // Opción A: Usar el filename para construir la URL (como estaba antes)
    this.backupService.downloadBackup(backup.filename).subscribe({
    // Opción B: Si tienes downloadBackupByUrl y la URL es relativa a la API_URL
    // this.backupService.downloadBackupByUrl(backup.download_url).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.notificacionService.success('Descarga Completa', `${backup.filename} ha sido descargado.`);
      },
      error: (err) => {
        console.error('Error al descargar backup:', err);
        this.notificacionService.error('Error', `No se pudo descargar el archivo ${backup.filename}.`);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  onRestoreBackup(): void {
    if (!this.selectedFile) {
      this.notificacionService.warn('Archivo no seleccionado', 'Por favor, selecciona un archivo .sql para restaurar.');
      return;
    }

    this.restoringBackup = true;
    this.backupService.restoreBackup(this.selectedFile).subscribe({
      next: (response) => {
        this.notificacionService.success('Restauración Iniciada', response.message || 'La base de datos se está restaurando desde el archivo.');
        this.selectedFile = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = ''; // Limpiar el input de archivo
        }
        this.restoringBackup = false;
      },
      error: (err) => {
        console.error('Error al restaurar backup:', err);
        this.notificacionService.error('Error', 'No se pudo iniciar la restauración de la base de datos.');
        this.restoringBackup = false;
      }
    });
  }
}
