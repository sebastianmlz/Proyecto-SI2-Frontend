import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { PaginatedResponse } from '../models/paginated-response.model';



@Injectable({
  providedIn: 'root'
})

export class UserService {

  baseUrl = environment.apiUrl + '/auth/users/';

  constructor(private http: HttpClient) { }

  agregarUsers(user: Partial<User>): Observable<User> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<User>(this.baseUrl, user, { headers });
  }

  obtenerUsers(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<User>> {
      const token = localStorage.getItem('access');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const params = new HttpParams()
        .set('page', page.toString())
        .set('page_size', pageSize.toString());
        
      return this.http.get<PaginatedResponse<User>>(`${this.baseUrl}`, { headers, params });
    }
  
  
  actualizarUser(id: number, user: Partial<User>): Observable<User> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<User>(`${this.baseUrl}${id}/`, user, { headers });
  }


  eliminarUsuario(id: number): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete(`${this.baseUrl}${id}/`, {
      headers: headers,
      observe: 'response'  // ⚠️ esto fuerza a enviar bien los headers
    });
  }

  changePassword(data: { old_password: string, new_password: string }): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}change-password/`, data, { headers });
  }


  
  
  

  
}
