import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Product {
  id: number;
  nombre: string;
  activo: boolean;
  especificaciones: string;
  image: string;
  price: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})


export class ProductosService {
  baseUrl = environment.apiUrl + '/products';

  constructor(private http: HttpClient) { }

  obtenerProductos(page: number = 1, pageSize: number = 20): Observable<any> {
    return this.http.get(`${this.baseUrl}?page=${page}&page_size=${pageSize}`);
  }

  agregarProductos(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  actualizarProducto(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${product.id}`, product);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
