import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private baseUrl = environment.apiUrl + '/orders';
    constructor(private http: HttpClient) { }

    // Crear orden general
    createFinance(data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/finance/`, data, { headers });
    }

    //order-item
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

    //metodo de pago stripe
    createStripeCheckout(orderId: number): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        return this.http.post(
            `${this.baseUrl}/stripe-checkout/`,
            { order_id: orderId },
            { headers }
        );
    }

    //obtener todas las ventas
    getVentas(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<any>> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        const params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', pageSize.toString());

        return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/finance/`, { headers, params });
    }

    // Asociar dirección a la orden
    associateAddressToOrder(orderId: number, addressData: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        // Combina el orderId y los datos de la dirección en un solo objeto
        const payload = {
            order_id: orderId,
            ...addressData
        };
        return this.http.post(`${this.baseUrl}/deliveries/`, payload, { headers });
    }


    // Obtener ítems (opcional)
    getOrderItems(): Observable<any> {
        return this.http.get(`${this.baseUrl}/items/`);
    }

    // Eliminar ítem
    deleteOrderItem(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/items/${id}/`);
    }



    //order feedback

    createOrderFeedback(data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/feedback/submit/`, data, { headers });
    }

    rateProductFeedback(data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/feedback/rate-product/`, data, { headers });
    }

    rateDeliveryFeedback(data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/feedback/rate-delivery/`, data, { headers });
    }

    getOrderFeedback(page: number = 1, pageSize: number = 10): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', pageSize.toString());
        return this.http.get(`${this.baseUrl}/feedback/`, { headers, params });
    }

    getOrderFeedbackById(id: number): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.baseUrl}/feedback/${id}/`, { headers });
    }

    //order delivery
    getOrderDeliveryStatus(orderId: number): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.baseUrl}/deliveries/${orderId}/`, { headers });
    }

    patchOrderDeliveryStatus(orderId: number, data: any): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.patch(`${this.baseUrl}/deliveries/${orderId}/`, data, { headers });
    }

    //Asignar un delivery despues de la compra
    assignDeliveryToOrder(orderId: number): Observable<any> {
        const token = localStorage.getItem('access');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        // Combina el orderId y los datos de la entrega en un solo objeto
        const payload = {
            order_id: orderId
        };
        return this.http.post(`${this.baseUrl}/finance/${orderId}/assign-delivery/`, {}, { headers });
    }

}









