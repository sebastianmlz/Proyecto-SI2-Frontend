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
import { ProductosService } from '../../../Services/ProductService/productos.service';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { Product } from '../../../models/product.model';
import { Inventory } from '../../../models/inventario.model';
import { ProductWithInventory } from '../../../models/producto-inventario.model';

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
  inventarios:Inventory[] = [];
  productosCompletos: ProductWithInventory[] = [];


  constructor(public productos: ProductosService,
    private authService: AuthService,
    private noti: NotificacionService,
  ) { }

  ngOnInit() {
    this.cargarDatosCompletos();
  }

  cargarProductos() {
    this.productos.obtenerProductos().subscribe({
      next: (res) => {
        this.products = res.items;
      },
      error: (err) => console.error('Error al cargar los productos', err),
    });
  }

  cargarInventario(): void {
    this.productos.obtenerInventarioCompleto().subscribe({
      next: (res) => {
        this.inventarios = res.items;
      },
      error: (err) => console.error('Error al obtener inventario', err),
    });
  }



cargarDatosCompletos() {
  this.productos.obtenerProductos().subscribe({
    next: (resProd) => {
      const productos = resProd.items;

      this.productos.obtenerInventarioCompleto().subscribe({
        next: (resInv) => {
          const inventarios = resInv.items;
          console.log("productos: ",productos);
          // Unimos productos con inventario por ID
          this.productosCompletos = productos.map(producto => {
            const inv = inventarios.find(i => i.product_id === producto.id);
            
            return {
              id: producto.id,
              name: producto.name,
              active: producto.active,
              image_url: producto.image_url,
              category: producto.category.name || '',
              technical_specifications: producto.technical_specifications || '',
              description: producto.description || '',
              price_usd: inv?.price_usd ?? 0
            };
            
            
          });
          
          
        },
        error: (err) => console.error("Error al obtener inventario", err),
      });
    },
    error: (err) => console.error("Error al obtener productos", err),
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
