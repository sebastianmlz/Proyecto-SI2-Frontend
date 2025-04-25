import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private baseUrl = environment.apiUrl + '/orders';

    constructor(private http: HttpClient) {}

    // Crear orden general
    createFinance(data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/finance/`, data, { headers });
    }

    //crear order-item
    createOrderItem(data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/order-items/`, data, { headers });
    }

    patchOrderItem(itemId: number, data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.patch<any>(`${this.baseUrl}/order-items/${itemId}/`, data, { headers });
    }      

    eliminarOrderItem(id: number): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.baseUrl}/order-items/${id}/`, { headers });
    }      


    /**  ⬇️  NUEVO  —  POST /orders/stripe-checkout/  */
    createStripeCheckout(orderId: number): Observable<any> {
        const token  = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        return this.http.post(
        `${this.baseUrl}/stripe-checkout/`,
        { order_id: orderId },
        { headers }
        );
    }

    getVentas(): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
        return this.http.get(`${this.baseUrl}/finance/`, { headers });
    }      






    // // Crear delivery
    // createDelivery(data: any): Observable<any> {
    //     const token = localStorage.getItem('access');
    //     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    //     return this.http.post(`${this.baseUrl}/deliveries/`, data, { headers });
    // }

    // Obtener ítems (opcional)
    getOrderItems(): Observable<any> {
        return this.http.get(`${this.baseUrl}/items/`);
    }

    // Eliminar ítem
    deleteOrderItem(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/items/${id}/`);
    }
}









