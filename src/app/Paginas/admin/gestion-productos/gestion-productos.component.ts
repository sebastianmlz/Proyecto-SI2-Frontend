import { Component } from '@angular/core';
import { TableProductsComponent } from "../../../componentes/table/table-products/table-products.component";
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, TableProductsComponent],
  templateUrl: './gestion-productos.component.html',
  styleUrl: './gestion-productos.component.css'
})
export class GestionProductosComponent {

  constructor() { }
  
}
