import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../ProductService/productos.service';

@Injectable({
  providedIn: 'root'
})
export class ApiFakeService {
  constructor(private fakehttp: HttpClient) {}

  getProductos():Observable<any>{
    return this.fakehttp.get<Product[]>('https://fakestoreapi.com/products');
  }
}
