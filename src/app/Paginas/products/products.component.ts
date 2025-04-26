import { Component } from '@angular/core';
import { CardsComponent } from "../../componentes/cards/cards.component";
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { Product } from '../../models/product.model';
import { Inventory } from '../../models/inventario.model';
import { ProductWithInventory } from '../../models/producto-inventario.model';
import { RedirectCommand } from '@angular/router';

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
    private products: ProductosService,

  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.products.obtenerProductos().subscribe({
      next: (resProd) => {
        const productos = resProd.items;

        this.products.obtenerInventarioCompleto().subscribe({
          next: (resInv) => {
            const inventarios = resInv.items;

            // Unimos productos con inventario por ID
            this.productos = productos.map(producto => {
              const inv = inventarios.find(i => i.product_id === producto.id);
              return {
                id: producto.id,
                name: producto.name,
                description: producto.description,
                image_url: producto.image_url,
                price_usd: inv?.price_usd ?? 0,
                stock: inv?.stock ?? 0,
                active: producto.active,
                category: producto.category.name,
                category_id: producto.category.id,
                brand_id: producto.brand.id,
                warranty_id: producto.warranty.id,
                model_3d_url: producto.model_3d_url,
                ar_url: producto.ar_url,
                inventory_id: inv?.id ?? 0,
                technical_specifications: producto.technical_specifications ?? ''
              };
            });
          },
          error: (err) => console.error('Error al obtener inventario', err),
        });
      },
      error: (err) => console.error('Error al cargar productos', err),
    });
  }

  verDetalles(producto:ProductWithInventory){
    window.location.href = `/productos/${producto.id}`;
  }
}
