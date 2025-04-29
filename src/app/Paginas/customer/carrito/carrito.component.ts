import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { OrdersService } from '../../../services/orders.service';
import { ActivatedRoute } from '@angular/router';
import { DeliveryAdressService } from '../../../services/delivery-adress.service';
import { forkJoin } from 'rxjs';
import { ParametersService } from '../../../services/parameters.service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';



@Component({
  selector: 'app-carrito',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule, DropdownModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {

  carrito: any[] = [];
  totalPagar: number = 0;

  ordenActivaId: number | null = null;
  editedItems: { [id: number]: boolean } = {}; // controlamos qué item fue editado
  //agregamos las direcciones en estas variables
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

  selectedCountry!: number | null;
  selectedState!: number | null;
  selectedCity!: number | null;

  postalCode: string = '';
  recipientName: string = '';
  recipientPhone: string = '';
  addressLine1: string = '';
  addressLine2: string = '';

  direccionGuardada: any = null; // para guardar la dirección creada
  mostrarModalDireccion: boolean = false; // para abrir/cerrar modal

  // Para la sección de mis direcciones
  direcciones: any[] = [];
  selectedDireccionId: number | null = null;
  mostrarMisDirecciones: boolean = false;
  selectedDireccion: any = null; // Agrega esta variable para guardar la dirección seleccionada


  constructor(
    // private productosService: ProductosService,
    private authService: AuthService,
    private ordersService: OrdersService,
    private noti: NotificacionService,
    private router: ActivatedRoute, // 👈 agrega esto
    private deliveryAdressService: DeliveryAdressService,
    private parametersService: ParametersService
  ) { }


  ngOnInit(): void {
    this.cargarPaises();
    this.cargarDirecciones(); // Añadir esta línea
    
    const pagoExitoso = this.router.snapshot.queryParamMap.get('payment') === 'success';
    const ordenPendiente = localStorage.getItem('pendingOrder');

    if (pagoExitoso && ordenPendiente) {
      localStorage.removeItem('pendingOrder');
      this.carrito = [];
      this.totalPagar = 0;
      this.noti.success('Pago exitoso', 'Tu compra fue procesada correctamente');
      return;
    }

    // Obtener última orden activa del backend
    this.ordersService.getVentas().subscribe({
      next: (res: any) => {
        const ordenes = res.items;
        if (ordenes.length === 0) return;

        const ultimaOrden = ordenes[0]; // orden más reciente
        this.ordenActivaId = ultimaOrden.id;
        console.log("ultima orden: ", ultimaOrden);
        const estadoPago = ultimaOrden.payment?.payment_status;

        if (estadoPago !== 'completed') {
          // Si no está completada, usar esta orden

          this.carrito = ultimaOrden.items.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price_usd: item.product.price_usd,
            quantity: item.quantity,
            image_url: item.product.image_url,
            order_item_id: item.id // para luego usarlo en el PATCH
          }));
          this.calcularTotal();
          console.log('Última orden activa cargada:', this.carrito);
        } else {
          // Si está completada, no mostrar carrito
          this.carrito = [];
          this.totalPagar = 0;
          console.log('La última orden ya está completada');
        }
      },
      error: (err) => {
        console.error('Error al cargar órdenes:', err);
      }
    });
  }

  cargarPaises(): void {
    this.parametersService.getCountries().subscribe({
      next: (res: any) => {
        console.log('Países cargados:', res);
        this.countries = res.items || []; // 🔥 CORRECTO: acceder a res.items
      },
      error: (err) => {
        console.error('Error al cargar países:', err);
        this.countries = [];
      }
    });
  }

  onCountrySelected(): void {
    if (this.selectedCountry) {
      this.parametersService.getStatesByCountry(this.selectedCountry).subscribe({
        next: (res: any) => {
          console.log('Estados recibidos:', res);
          this.states = res.items || []; // 🚀 Los estados ahora vienen filtrados
          this.selectedState = null;
          this.cities = [];
          this.selectedCity = null;
        },
        error: (err) => {
          console.error('Error al cargar estados:', err);
          this.states = [];
        }
      });
    }
  }

  onStateSelected(): void {
    if (this.selectedState) {
      this.parametersService.getCitiesByState(this.selectedState).subscribe({
        next: (res: any) => {
          console.log('Ciudades recibidas:', res);
          this.cities = res.items || []; // 🚀 Las ciudades ahora vienen filtradas
          this.selectedCity = null;
        },
        error: (err) => {
          console.error('Error al cargar ciudades:', err);
          this.cities = [];
        }
      });
    }
  }

  abrirModalDireccion(): void {
    this.mostrarModalDireccion = true;
  }

  cerrarModalDireccion(): void {
    this.mostrarModalDireccion = false;
  }

  guardarCantidad(item: any): void {
    if (!item.order_item_id || item.quantity <= 0) {
      this.noti.warn('Cantidad inválida', 'No se puede actualizar');
      return;
    }

    const data = { quantity: item.quantity };
    this.ordersService.patchOrderItem(item.order_item_id, data).subscribe({
      next: () => {
        this.noti.success('Cantidad actualizada', 'El producto fue actualizado');
        this.editedItems[item.id] = false; // ocultar botón
        this.calcularTotal();
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
        this.noti.error('Error', 'No se pudo actualizar la cantidad');
      }
    });
  }

  marcarComoEditado(itemId: number): void {
    this.editedItems[itemId] = true;
  }

  eliminarItemBackend(item: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      const orderItemId = item.order_item_id; // asegurate que este campo exista
      if (!orderItemId) {
        this.noti.error('Error', 'No se encontró el ID del item para eliminar');
        return;
      }

      this.ordersService.eliminarOrderItem(orderItemId).subscribe({
        next: () => {
          // Eliminar del array del frontend también
          this.carrito = this.carrito.filter(i => i.order_item_id !== orderItemId);
          this.noti.success('Producto eliminado', 'El producto fue eliminado del carrito');
          this.calcularTotal();
        },
        error: (err) => {
          console.error('Error al eliminar el producto:', err);
          this.noti.error('Error', 'No se pudo eliminar el producto');
        }
      });
    }
  }

  crearDireccion(): void {
    const direccionPayload = {
      address_name: this.addressLine1 || 'Dirección principal',
      recipient_name: this.recipientName,
      recipient_phone: this.recipientPhone,
      address_line1: this.addressLine1,
      address_line2: this.addressLine2,
      city: this.selectedCity,
      state: this.selectedState,
      country: this.selectedCountry,
      postal_code: this.postalCode,
      is_default: true
    };

    this.deliveryAdressService.CrearDireccionPedido(direccionPayload).subscribe({
      next: (direccionCreada: any) => {
        console.log('Dirección creada correctamente:', direccionCreada);
        this.direccionGuardada = direccionCreada;
        this.mostrarModalDireccion = false; // Cerrar modal
        this.noti.success('Dirección registrada', 'Tu dirección se guardó exitosamente');
      },
      error: (err) => {
        console.error('Error al crear dirección:', err);
        this.noti.error('Error', 'No se pudo registrar la dirección');
      }
    });
  }

  cargarDirecciones(): void {
    this.deliveryAdressService.obtenerDireccionesPedido().subscribe({
      next: (res: any) => {
        console.log('Direcciones cargadas:', res);
        this.direcciones = res.items || [];
      },
      error: (err) => {
        console.error('Error al cargar direcciones:', err);
        this.noti.error('Error', 'No se pudieron cargar las direcciones');
      }
    });
  }

  seleccionarDireccion(direccionId: number): void {
    this.selectedDireccionId = direccionId;
    // Busca y guarda el objeto dirección completo
    this.selectedDireccion = this.direcciones.find(dir => dir.id === direccionId) || null;
    console.log('Dirección seleccionada:', this.selectedDireccion);
  }

  confirmarSeleccionDireccion(): void {
    if (this.selectedDireccionId) {
      // Buscar la dirección seleccionada en el array
      const direccionSeleccionada = this.direcciones.find(dir => dir.id === this.selectedDireccionId);
      if (direccionSeleccionada) {
        this.noti.success('Dirección seleccionada', 'Se ha seleccionado la dirección correctamente');
        console.log('Dirección seleccionada:', direccionSeleccionada);
        this.mostrarMisDirecciones = false;
        // Aquí puedes almacenar la dirección o usarla para el proceso de compra
      }
    } else {
      this.noti.warn('Selección requerida', 'Debes seleccionar una dirección');
    }
  }

  abrirMisDirecciones(): void {
    this.cargarDirecciones();
    this.mostrarMisDirecciones = true;
  }

  cerrarMisDirecciones(): void {
    this.mostrarMisDirecciones = false;
  }

  ordenar(): void {
    const orderId = this.ordenActivaId;
    console.log('orden activa:', orderId);

    if (!orderId) {
      this.noti.error('Error', 'No se encontró una orden activa para continuar con el pago');
      return;
    }

    // Verificar si hay una dirección seleccionada
    if (!this.selectedDireccion) {
      this.noti.warn('Dirección requerida', 'Por favor selecciona una dirección de entrega');
      this.abrirMisDirecciones();
      return;
    }

    // Prepara el payload con los datos requeridos por la API
    const direccionPayload = {
      recipient_name: this.selectedDireccion.recipient_name,
      recipient_phone: this.selectedDireccion.recipient_phone,
      address_line1: this.selectedDireccion.address_line1,
      address_line2: this.selectedDireccion.address_line2,
      city: this.selectedDireccion.city,
      state: this.selectedDireccion.state,
      country: this.selectedDireccion.country,
      postal_code: this.selectedDireccion.postal_code,
      // delivery_status: 'pending', // o el valor por defecto que requiera tu backend
      // estimated_arrival: '',      // puedes dejarlo vacío o calcularlo si es necesario
      delivery_notes: ''          // puedes dejarlo vacío o agregar notas si tienes
    };

    // Asociar la dirección a la orden antes de proceder al pago
    this.ordersService.associateAddressToOrder(orderId, direccionPayload).subscribe({
      next: () => {
        // Proceder con el checkout de Stripe
        this.ordersService.createStripeCheckout(orderId).subscribe({
          next: (res: any) => {
            if (res.checkout_url) {
              localStorage.setItem('pendingOrder', String(orderId));
              window.location.href = res.checkout_url;
            } else {
              this.noti.error('Error', 'No se recibió la URL de Stripe');
            }
          },
          error: (err) => {
            console.error('Error al generar el checkout:', err);
            this.noti.error('Error', 'No se pudo generar el checkout');
          }
        });
      },
      error: (err) => {
        console.error('Error al asociar dirección:', err);
        this.noti.error('Error', 'No se pudo asociar la dirección a la orden');
      }
    });
    // this.ordersService.createStripeCheckout(orderId).subscribe({
    //   next: (res: any) => {
    //     if (res.checkout_url) {
    //       localStorage.setItem('pendingOrder', String(orderId));
    //       window.location.href = res.checkout_url;
    //     } else {
    //       this.noti.error('Error', 'No se recibió la URL de Stripe');
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error al generar el checkout:', err);
    //     this.noti.error('Error', 'No se pudo generar el checkout');
    //   }
    // });
  }

  calcularTotal(): void {
    this.totalPagar = this.carrito.reduce((acc, item) =>
      acc + (item.price_usd * item.quantity), 0);
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  eliminarItem(item: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      // Verificar que el item tenga un order_item_id válido
      if (!item.order_item_id) {
        this.noti.error('Error', 'No se encontró el ID del item para eliminar');
        return;
      }

      // Llamar al servicio para eliminar en el backend
      this.ordersService.eliminarOrderItem(item.order_item_id).subscribe({
        next: () => {
          // Si la eliminación en el backend fue exitosa, actualizar el frontend
          this.carrito = this.carrito.filter(i => i.order_item_id !== item.order_item_id);
          this.calcularTotal();
          this.noti.success('Producto eliminado', 'El producto fue eliminado del carrito');
        },
        error: (err) => {
          console.error('Error al eliminar el producto:', err);
          this.noti.error('Error', 'No se pudo eliminar el producto del carrito');
        }
      });
    }
  }


}
