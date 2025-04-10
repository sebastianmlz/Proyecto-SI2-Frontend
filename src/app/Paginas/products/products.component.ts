import { Component } from '@angular/core';
import { CardsComponent } from "../../componentes/cards/cards.component";
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ApiFakeService } from '../../services/Api/ApiFake.service';
import { ProductWithInventory } from '../../models/producto-inventario.model';
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CardsComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  productos: ProductWithInventory[] = [];

  constructor(
    private apifake: ApiFakeService,

  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apifake.getProductos().subscribe({
      next: (data: ProductWithInventory[]) => {
        this.productos = data;
      },
      error: (error) => {
        console.error('Error al obtener los productos', error);
      }
    })
  }
}
