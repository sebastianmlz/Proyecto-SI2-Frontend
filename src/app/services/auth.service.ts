import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrlP = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<any>(this.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrlP}/login/`, {
      email: credentials.email,
      password: credentials.password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  

  registrarse(datos: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.baseUrlP}/users/`, datos, { headers });
  }
  
  

  agregarUsers(user: {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    active: boolean;
    password: string;
  }): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrlP}/users/`, user, { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }

  isAdmin(): boolean {
    return localStorage.getItem('user_role') === 'admin';
  }

  isCustomer(): boolean {
    return localStorage.getItem('user_role') === 'customer';
  }

  getUserById(userId: number): Observable<any> {
    const token = localStorage.getItem('access');
    if (!token) {
      throw new Error('Token no disponible');
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const url = `${this.baseUrlP}/users/${userId}?path_params={}`;
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
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    this.currentUserSubject.next(null); // Limpieza total del observable
    this.router.navigate(['/ingreso']);
  }  

}
