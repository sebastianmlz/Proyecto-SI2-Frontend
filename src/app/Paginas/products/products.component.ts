import { Component } from '@angular/core';
import { CardsComponent } from "../../componentes/cards/cards.component";
import { CommonModule } from '@angular/common';
import { Product } from '../../Services/ProductService/productos.service';
import { ApiFakeService } from '../../Services/Api/ApiFake.service';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CardsComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  productos: Product[] = [];

  constructor(
    private apifake: ApiFakeService,

  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apifake.getProductos().subscribe({
      next: (data: Product[]) => {
        this.productos = data;
      },
      error: (error) => {
        console.error('Error al obtener los productos', error);
      }
    })
  }
}
