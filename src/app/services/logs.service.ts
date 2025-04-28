// src/app/services/logs.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LogsService {
    private baseUrl = `${environment.apiUrl}/core/logs/`;

    constructor(private http: HttpClient) {}

    obtenerBitacora(page: number = 1, pageSize: number = 10) {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', pageSize.toString());
        return this.http.get<any>(this.baseUrl, { headers, params });
    }
}
