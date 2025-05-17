import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackupListResponse, BackupFile } from '../models/backup.model'; // Importar modelos

@Injectable({
  providedIn: 'root'
})
export class BackupRestoreService {
  private baseUrl = environment.apiUrl + '/core/database'; // Ajusta según la base de tu API

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access'); // o donde almacenes tu token
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createBackup(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.baseUrl}/backup-restore/`, {}, { headers });
  }

  listBackups(): Observable<BackupListResponse> { // Usar la interfaz para la respuesta
    const headers = this.getAuthHeaders();
    return this.http.get<BackupListResponse>(`${this.baseUrl}/backup-restore/`, { headers });
  }

  // Opción 1: Mantener downloadBackup con filename (si la URL de descarga siempre sigue el mismo patrón)
  downloadBackup(filename: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    // La URL completa sería environment.apiUrl + download_url (si download_url es relativa a la API base)
    // O si download_url es una URL completa, usarla directamente.
    // Por ahora, asumimos que el backend devuelve una URL relativa al baseUrl del servicio.
    // Si download_url es absoluta, este método necesitaría cambiar.
    // Si download_url es relativa a la API_URL general, entonces:
    // return this.http.get(`${environment.apiUrl}${downloadUrlFromBackupObject}`, { headers, responseType: 'blob' });
    // Por simplicidad, si el patrón es consistente:
    return this.http.get(`${this.baseUrl}/backup-download/${filename}/`, { // Mantenemos la construcción manual por ahora
      headers,
      responseType: 'blob'
    });
  }

  // Opción 2: Usar la download_url directamente (más robusto si la URL puede cambiar)
  // downloadBackupByUrl(downloadUrl: string): Observable<Blob> {
  //   const headers = this.getAuthHeaders();
  //   // Asumimos que downloadUrl es relativa a environment.apiUrl
  //   // Si es una URL absoluta, simplemente usa this.http.get(downloadUrl, ...)
  //   return this.http.get(`${environment.apiUrl}${downloadUrl}`, {
  //     headers,
  //     responseType: 'blob'
  //   });
  // }

  restoreBackup(file: File): Observable<any> {
    const headers = this.getAuthHeaders(); // El backend podría no necesitar Content-Type aquí si lo infiere
    const formData = new FormData();
    formData.append('backup_file', file, file.name);

    return this.http.post<any>(`${this.baseUrl}/restore/`, formData, { headers });
  }
}
