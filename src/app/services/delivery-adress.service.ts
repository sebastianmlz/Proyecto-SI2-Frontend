import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DeliveryAdressService {
  baseUrl = environment.apiUrl + '/orders/'; // Adjust the URL as needed
  constructor(private http: HttpClient) { }

  CrearDireccionPedido(data: any)  : Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}delivery-addresses/`, data, { headers });
  }

  obtenerDireccionesPedido(): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}delivery-addresses/`, { headers });
  }

  eliminarDireccionPedido(id: number): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}delivery-addresses/${id}/`, { headers });
  }

  obtenerDireccionPedidoID(id: number): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}delivery-addresses/${id}/`, { headers });
  }








  


}
