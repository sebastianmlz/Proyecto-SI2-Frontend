import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


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