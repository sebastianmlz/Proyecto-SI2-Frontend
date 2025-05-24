import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PaginatedResponse } from '../models/paginated-response.model';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerLoyaltyService {

  baseUrl = environment.apiUrl+'/auth/loyalty/';

  constructor(private http: HttpClient) { }

  getCustomerLoyalty(page: number = 1, pageSize: number = 10): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const params = new HttpParams().
    set('page', page.toString())
    .set('page_size', pageSize.toString());

    return this.http.get<any>(`${this.baseUrl}`, { headers, params });
  }

  getCustomerLoyaltyById(id: number): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}${id}/`, { headers });
  }

  getCustomerLoyaltyMe(): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}me/`, { headers });
  }

  getStatusLoyalty(): Observable<any>{
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}status/`, { headers });
  }
}
