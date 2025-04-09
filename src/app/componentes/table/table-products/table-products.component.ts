import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { Product, ProductosService } from '../../../Services/ProductService/productos.service';


@Component({
  selector: 'app-table-products',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    FileUploadModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule
  ],
  templateUrl: './table-products.component.html',
  styleUrl: './table-products.component.css'
})
export class TableProductsComponent {
  products: Product[] = [];

  constructor(public productos: ProductosService) { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productos.obtenerProductos().subscribe({
      next: (res) => {
        this.products = res.items;
      },
      error: (err) => console.error('Error al cargar los productos', err),
    });
  }

  eliminarProducto(id: number): void {
    this.productos.eliminarProducto(id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al eliminar el producto', err),
    });
  }

  agregarProducto(newProduct: Product): void {
    this.productos.agregarProductos(newProduct).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al agregar el producto', err),
    });
  }

  actualizarProducto(updatedProduct: Product): void {
    this.productos.actualizarProducto(updatedProduct).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al actualizar el producto', err),
    })
  }
}
