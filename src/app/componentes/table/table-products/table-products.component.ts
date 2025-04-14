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
  inventarios: Inventory[] = [];
  productosCompletos: ProductWithInventory[] = [];
  productoEditable: any = {};
  editarProductoModalVisible = false;

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
    technical_specifications: '',
    stock: 0
  };
  nuevoProductoModalVisible = false;
  stock: number = 0;
  price_usd: number = 0;

  abrirModalEditarProducto(productId: number): void {
    const productosCompleto = this.productosCompletos.find(p => p.id === productId);
    if (!productosCompleto) {
      console.error('Producto no encontrado para editar');
      return;
    }

    this.productoEditable = {
      id: productosCompleto.id,
      name: productosCompleto.name,
      description: productosCompleto.description,
      technical_specifications: productosCompleto.technical_specifications,
      brand_id: productosCompleto.brand_id,
      category_id: productosCompleto.category_id,
      warranty_id: productosCompleto.warranty_id,
      model_3d_url: productosCompleto.model_3d_url,
      ar_url: productosCompleto.ar_url,
      image: null, // file solo si se cambia
      inventory_id: productosCompleto.inventory_id,
      price_usd: productosCompleto.price_usd,
      stock: productosCompleto.stock
    };
    this.editarProductoModalVisible = true;
  }


  constructor(public productos: ProductosService,
    private authService: AuthService,
    private noti: NotificacionService,
  ) { }

  ngOnInit() {
    this.cargarDatosCompletos();
    this.cargarFormOpciones();
    console.log("productos cargados:", this.productos);
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
  
            console.log("Productos recibidos:", productos);
  
            // Unimos productos con inventario por product_id
            const combinados = productos.map(producto => {
              const inv = inventarios.find(i => i.product_id === producto.id);
              if (!inv) return null;
            
              return {
                id: producto.id,
                name: producto.name,
                active: producto.active,
                image_url: producto.image_url,
                category: producto.category.name || '',
                category_id: producto.category.id,
                brand_id: producto.brand.id,
                warranty_id: producto.warranty.id,
                technical_specifications: producto.technical_specifications || '',
                description: producto.description || '',
                price_usd: inv.price_usd,
                stock: inv.stock,
                inventory_id: inv.id,
                model_3d_url: producto.model_3d_url || '',
                ar_url: producto.ar_url || ''
              };
            }).filter(p => p !== null);
            
            // ✅ Ahora recién se clona el array resultante
            this.productosCompletos = [...combinados];
            
          },
          error: (err) => console.error("❌ Error al obtener inventario", err),
        });
      },
      error: (err) => console.error("❌ Error al obtener productos", err),
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
      technical_specifications: '',
      stock: 0
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
            this.noti.success('Registro exitoso', 'Producto registrado exitosamente');
            this.nuevoProductoModalVisible = false;
            // Recargar tabla, etc...
            this.cargarDatosCompletos();
          },
          error: (err) => {
            console.error('Error al registrar inventario:', err);
            this.noti.error('No se pudo regitrar producto con inventario', 'Hubo un error al registrar el producto');
          }
        });
      },
      error: (err) => {
        console.error('Error al registrar producto', err);
        this.noti.error('No se pudo regitrar producto', 'Hubo un error al registrar el producto');
      }
    });
  }


  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.productoEditable.image = file;
  }


  /*Funcion para abrir el modal con los datos cargados*/
  editarProducto(): void {
    const formData = new FormData();
    formData.append('name', this.productoEditable.name);
    formData.append('description', this.productoEditable.description);
    formData.append('technical_specifications', this.productoEditable.technical_specifications);
    formData.append('brand_id', this.productoEditable.brand_id.toString());
    formData.append('category_id', this.productoEditable.category_id.toString());
    formData.append('warranty_id', this.productoEditable.warranty_id.toString());
    formData.append('model_3d_url', this.productoEditable.model_3d_url || '');
    formData.append('ar_url', this.productoEditable.ar_url || '');
    if (this.productoEditable.image) {
      formData.append('image', this.productoEditable.image);
    }
  
    this.productos.editarProducto(this.productoEditable.id, formData).subscribe({
      next: () => {
        const invData = {
          stock: this.productoEditable.stock,
          price_usd: this.productoEditable.price_usd
        };
  
        this.productos.actualizarInventario(this.productoEditable.inventory_id, invData).subscribe({
          next: () => {
            this.noti.success('✅ Producto actualizado', 'Producto e inventario fueron actualizados correctamente');
            this.editarProductoModalVisible = false;
            setTimeout(() => {
              this.cargarDatosCompletos();
            }, 300); // o hasta 500 ms si es necesario
            

          },
          error: (err) => {
            console.error('❌ Error al actualizar inventario:', err);
            this.noti.error('Error', 'No se pudo actualizar el inventario');
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al actualizar producto:', err);
        this.noti.error('Error', 'No se pudo actualizar el producto');
      }
    });
  }
  



  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productos.eliminarProducto(id).subscribe({
        next: () => {
          this.noti.success('Producto eliminado', 'El producto fue eliminado correctamente');
          this.cargarDatosCompletos(); // mejor usar cargarDatosCompletos si usás inventario también
        },
        error: (err) => {
          console.error('Error al eliminar el producto', err);
          this.noti.error('Error', 'No se pudo eliminar el producto');
        }
      });
    }
  }

  // agregarProducto(newProduct: Product): void {
  //   this.productos.agregarProductos(newProduct).subscribe({
  //     next: () => this.cargarProductos(),
  //     error: (err) => console.error('Error al agregar el producto', err),
  //   });
  // }
}
