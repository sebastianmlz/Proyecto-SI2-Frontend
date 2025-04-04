import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

Injectable({
  providedIn: 'root'
})

export interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
  description?: string;
}

export class ProductosService {
  private productSource = new BehaviorSubject<Product | null>(null);

  constructor() { }
}
