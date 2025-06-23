import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DeliveryAssignmentResponse } from '../models/delivery-assignment.model';


@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  private apiUrl = `${environment.apiUrl}/auth/deliveries`;
  constructor(private http: HttpClient) { }

  getMyAssignments(page: number = 1, pageSize: number = 10): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<any>(`${this.apiUrl}/assignments/my_assignments/`, { headers, params });
  }

  getMyAssignmentss(page: number = 1, pageSize: number = 10): Observable<DeliveryAssignmentResponse> {
    const token = localStorage.getItem('access');
    if (!token) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    
    console.log(`📤 Obteniendo asignaciones: ${this.apiUrl}/assignments/`);
    
    return this.http.get<DeliveryAssignmentResponse>(`${this.apiUrl}/assignments/`, { 
      headers, 
      params 
    }).pipe(
      map((response: DeliveryAssignmentResponse) => {
        // Agregar propiedad count que apunte al mismo valor que total
        return {
          ...response,
          count: response.total
        };
      }),
      catchError((error: any) => {
        console.error('Error obteniendo asignaciones de delivery:', error);
        return throwError(() => error);
      })
    );
  }

  CompletarPedido(orderId:number): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/assignments/${orderId}/complete_delivery/`, {}, { headers });
  }

  EmpezarPedido(orderId: number): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/assignments/${orderId}/start_delivery/`, {}, { headers });
  }

  patchEstadoPedido(orderId: number, estado: string): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<any>(`${this.apiUrl}/assignments/${orderId}/`, { status: estado }, { headers });
  }
}

