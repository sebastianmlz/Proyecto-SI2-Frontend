import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../../services/productos.service';
import { ProductWithInventory } from '../../../models/producto-inventario.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AngleLeftIcon, AngleRightIcon } from 'primeng/icons';

@Component({
  selector: 'app-products-details',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, AngleLeftIcon, AngleRightIcon],
  templateUrl: './products-details.component.html',
  styleUrls: ['./products-details.component.css']
})


export class ProductsDetailsComponent {
  producto!: ProductWithInventory

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
  ) { }

  rotationAngle: number = 0;

  girarIzquierda() {
    this.rotationAngle -= 180; // rotamos de a 30°
  }

  girarDerecha() {
    this.rotationAngle += 180;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Llamamos a los productos e inventarios
    this.productosService.obtenerProductos().subscribe({
      next: (resProd) => {
        const producto = resProd.items.find(p => p.id === id);

        if (!producto) {
          console.error('Producto no encontrado');
          return;
        }

        // Ahora llamamos al inventario
        this.productosService.obtenerInventarioCompleto().subscribe({
          next: (resInv) => {
            const inventario = resInv.items.find(i => i.product_id === id);

            if (!inventario) {
              console.warn('Inventario no encontrado');
              return;
            }

            // Finalmente armamos el objeto completo
            this.producto = {
              id: producto.id,
              name: producto.name,
              active: producto.active,
              image_url: producto.image_url,
              category: producto.category.name,
              category_id: producto.category.id,
              brand_id: producto.brand.id,
              warranty_id: producto.warranty.id,
              technical_specifications: producto.technical_specifications,
              description: producto.description,
              price_usd: inventario.price_usd,
              stock: inventario.stock,
              model_3d_url: producto.model_3d_url,
              ar_url: producto.ar_url,
              inventory_id: inventario.id
            };
          },
          error: err => console.error('Error al obtener inventario', err)
        });
      },
      error: err => console.error('Error al obtener productos', err)
    });
  }
}
