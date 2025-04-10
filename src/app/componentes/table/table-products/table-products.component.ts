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
import { ProductosService } from '../../../services/ProductService/productos.service';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { Product } from '../../../models/product.model';
import { Inventory } from '../../../models/inventario.model';
import { ProductWithInventory } from '../../../models/producto-inventario.model';
import { Brand } from '../../../models/brand.model';
import { Category } from '../../../models/category.model';
import { Warranty } from '../../../models/warranty.model';
import { CreateProduct } from '../../../models/create-product.model';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

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
    ToastModule,
    FormsModule,
    DialogModule,          // <--- para p-dialog
    DropdownModule,        // <--- para p-dropdown
    InputTextModule,       // <--- para pInputText
    InputTextModule,   // <--- para pInputTextarea
    ButtonModule,          // <--- para p-button
  ],
  templateUrl: './table-products.component.html',
  styleUrl: './table-products.component.css'
})
export class TableProductsComponent {

  //variables para obtener y cargar productos
  products: Product[] = [];
  inventarios:Inventory[] = [];
  productosCompletos: ProductWithInventory[] = [];

  //variables para registrar un producto
  brands: Brand[] = [];
  categories: Category[] = [];
  warranties: Warranty[] = [];
  
  nuevoProducto: CreateProduct = {
    brand_id: 0,
    category_id: 0,
    warranty_id: 0,
    name: '',
    description: '',
    active: true,
    image_url: {} as File,
    model_3d_url: '',
    ar_url: '',
    technical_specifications: ''
  };
  nuevoProductoModalVisible = false;
  stock: number = 0;
  price_usd: number = 0;


  constructor(public productos: ProductosService,
    private authService: AuthService,
    private noti: NotificacionService,
  ) { }

  ngOnInit() {
    this.cargarDatosCompletos();
    this.cargarFormOpciones();   
    console.log("productos cargados:",this.productos);
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

  cargarFormOpciones(): void {
    this.productos.getBrands().subscribe({
      next: (res) => this.brands = res.items,
      error: (err) => console.error('Error al cargar brands', err)
    });

    this.productos.getCategories().subscribe({
      next: (res) => this.categories = res.items,
      error: (err) => console.error('Error al cargar categories', err)
    });

    this.productos.getWarranties().subscribe({
      next: (res) => this.warranties = res.items,
      error: (err) => console.error('Error al cargar warranties', err)
    });
  }

  abrirModalNuevoProducto(): void {
    this.nuevoProducto = {
      brand_id: 0,
      category_id: 0,
      warranty_id: 0,
      name: '',
      description: '',
      active: true,
      image_url: {} as File,
      model_3d_url: '',
      ar_url: '',
      technical_specifications: ''
    };
    this.nuevoProductoModalVisible = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.nuevoProducto.image_url = file;
    }
  }

  registrarProducto(): void {
    const formData = new FormData();

    formData.append('brand_id', this.nuevoProducto.brand_id.toString());
    formData.append('category_id', this.nuevoProducto.category_id.toString());
    formData.append('warranty_id', this.nuevoProducto.warranty_id.toString());
    formData.append('name', this.nuevoProducto.name);
    formData.append('description', this.nuevoProducto.description);
    formData.append('active', this.nuevoProducto.active ? 'true' : 'false');
    formData.append('technical_specifications', this.nuevoProducto.technical_specifications);
    formData.append('image', this.nuevoProducto.image_url); // importante

    if (this.nuevoProducto.model_3d_url)
      formData.append('model_3d_url', this.nuevoProducto.model_3d_url);

    if (this.nuevoProducto.ar_url)
      formData.append('ar_url', this.nuevoProducto.ar_url);

    this.productos.createProduct(formData).subscribe({
      next: (productoCreado) => {
        const product_id = productoCreado.id;
        const inventario = {
          product_id,
          stock: this.stock,
          price_usd: this.price_usd
        };
  
        this.productos.createInventory(inventario).subscribe({
          next: () => {
            this.noti.success('Registro exitoso','Producto registrado exitosamente');
            this.nuevoProductoModalVisible = false;
            // Recargar tabla, etc...
            this.cargarDatosCompletos();
          },
          error: (err) => {
            console.error('Error al registrar inventario:', err);
            this.noti.error('No se pudo regitrar producto con inventario','Hubo un error al registrar el producto');
          }
        });
      },
      error: (err) => {
        console.error('Error al registrar producto', err);
        this.noti.error('No se pudo regitrar producto','Hubo un error al registrar el producto');
      }
    });
}




  actualizarProducto(updatedProduct: Product): void {
    this.productos.actualizarProducto(updatedProduct).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al actualizar el producto', err),
    })
  }

  eliminarProducto(id: number): void {
    this.productos.eliminarProducto(id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al eliminar el producto', err),
    });
  }

    // agregarProducto(newProduct: Product): void {
  //   this.productos.agregarProductos(newProduct).subscribe({
  //     next: () => this.cargarProductos(),
  //     error: (err) => console.error('Error al agregar el producto', err),
  //   });
  // }
}
