import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Product } from '../../models/product.model';
import { Inventario } from '../../models/inventario.model';

@Injectable({
  providedIn: 'root'
})

export class ProductosService {
  
  baseUrl = environment.apiUrl + '/products/';

  constructor(private http: HttpClient) { }

  agregarProductos(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  obtenerProductos(page: number = 1, pageSize: number = 20): Observable<{ items: Product[] }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ items: Product[] }>(`${this.baseUrl}?page=${page}&page_size=${pageSize}`, { headers });
  }

  obtenerInventarioCompleto(): Observable<{ items: Inventario[] }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ items: Inventario[] }>(`${this.baseUrl}inventory`, { headers });
  }
  

  actualizarProducto(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${product.id}`, product);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
