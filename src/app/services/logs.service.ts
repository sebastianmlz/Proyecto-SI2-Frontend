// src/app/services/logs.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LogsService {
    private baseUrl = `${environment.apiUrl}/core/logs/`;

    constructor(private http: HttpClient) {}

    obtenerBitacora() {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any>(this.baseUrl, { headers });
    }
}
