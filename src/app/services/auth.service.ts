import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://dismac-backend.up.railway.app/auth'; // 👉 Reemplaza con la URL que te pasaron

  constructor(private http: HttpClient,private router:Router) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/email`, credentials);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token'); // si lo estás usando
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    return localStorage.getItem('user_role') === 'admin';
  }
  
  isCustomer(): boolean {
    return localStorage.getItem('user_role') === 'customer';
  }

  registrarse(datos: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, datos);
  }
  
}
