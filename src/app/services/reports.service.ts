import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class reportsService {
    private baseUrl = environment.apiUrl + '/reports/';

    constructor(private http: HttpClient) {}

    // Obtener lista de reportes
    obtenerReportes() {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any[]>(this.baseUrl, { headers });
    }

    // Crear nuevo reporte
    crearReporte(data: any) {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<any>(this.baseUrl, data, { headers });
    }
}
