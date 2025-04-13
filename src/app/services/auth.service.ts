import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<any>(this.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

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

  registrarse(datos: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, datos);
  }

  agregarUsers(user: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/users`, user, { headers });
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

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  actualizarUsuario(): void {
    const user = this.getUser();
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    this.currentUserSubject.next(null); // Limpieza total del observable
    this.router.navigate(['/ingreso']);
  }  

}
