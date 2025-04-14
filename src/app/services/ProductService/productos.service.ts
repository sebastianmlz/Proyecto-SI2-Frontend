import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/product.model';
import { Inventory } from '../../models/inventario.model';
import { Brand } from '../../models/brand.model';
import { Category } from '../../models/category.model';
import { Warranty } from '../../models/warranty.model';
import { CreateProduct } from '../../models/create-product.model';

@Injectable({
  providedIn: 'root'
})

export class ProductosService {
  
  baseUrl = environment.apiUrl + '/products/';

  constructor(private http: HttpClient) { }

  // agregarProductos(product: Product): Observable<Product> {
  //   return this.http.post<Product>(this.baseUrl, product);
  // }

  createProduct(data: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}`, data, { headers });
  }

  createInventory(data: { product_id: number, stock: number, price_usd: number }): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}inventory`, data, { headers });
  }

  obtenerProductos(page: number = 1, pageSize: number = 20): Observable<{ items: Product[] }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ items: Product[] }>(`${this.baseUrl}?page=${page}&page_size=${pageSize}`, { headers });
  }

  obtenerInventarioCompleto(): Observable<{ items: Inventory[] }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ items: Inventory[] }>(`${this.baseUrl}inventory`, { headers });
  }
  
  editarProducto(product_id: number, data: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.baseUrl}${product_id}`, data, { headers });
  }

  actualizarInventario(inventoryId: number, data: { stock: number, price_usd: number }): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    const params = {
      stock: data.stock,
      price_usd: data.price_usd
    };
  
    return this.http.patch(`${this.baseUrl}inventory/${inventoryId}`, null, { headers, params });
  }
  
  
  
  eliminarProducto(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}${id}`, { headers });
  }

  getBrands(): Observable<{ items: Brand[] }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ items: Brand[] }>(`${this.baseUrl}brands`, { headers });
  }
  
  getCategories(): Observable<{ items: Category[] }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ items: Category[] }>(`${this.baseUrl}categories`, { headers });
  }
  
  getWarranties(): Observable<{ items: Warranty[] }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ items: Warranty[] }>(`${this.baseUrl}warranties`, { headers });
  }
  

}
