import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';




@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl + '/auth';


  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { username: string; password: string }): Observable<any> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', credentials.username);
    body.set('password', credentials.password);
    return this.http.post<any>(`${this.baseUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  getUserById(userId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token no disponible');
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const url = `${this.baseUrl}/users/${userId}?path_params={}`;
    return this.http.get(url, { headers });
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

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }


  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    this.router.navigate(['/ingreso']);
    // Forzar recarga para limpiar el estado y evitar glitches
    // this.router.navigate(['/ingreso']).then(() => {
    //   window.location.reload();
    // });
  }



}
