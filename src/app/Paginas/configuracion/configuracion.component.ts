import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NotificacionService } from '../../services/notificacion.service';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';
import { CustomerLoyaltyService } from '../../services/customer-loyalty.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule
  ]
})
export class ConfiguracionComponent implements OnInit {
  usuario: any;
  modoEdicion = false;
  mostrarCambioPassword = false;
  private baseUrl = environment.apiUrl;

  cambioPassword = {
    oldPassword: '',
    newPassword: ''
  };

  // Inicializamos con valores por defecto para que la UI se muestre rápido
  loyaltyInfo = {
    discount_percentage: '0%',
    total_orders: 0,
    last_order_date: null
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient,
    private noti: NotificacionService,
    private customerLoyaltyService: CustomerLoyaltyService
  ) { }

  ngOnInit() {
    // Cargar datos del usuario
    this.usuario = this.authService.getUser();
    
    // Cargar datos de lealtad inmediatamente sin esperar
    this.cargarDatosLealtad();
  }

  // Método para cargar datos de lealtad sin mostrar indicadores de carga
  cargarDatosLealtad() {
    // Primero intentamos obtener datos del usuario actual
    this.customerLoyaltyService.getCustomerLoyaltyMe().subscribe({
      next: (res) => {
        // Actualizamos los datos de lealtad con respuesta real
        if (res) {
          this.loyaltyInfo = {
            discount_percentage: res.discount_percentage || '0%',
            total_orders: res.total_orders || 0,
            last_order_date: res.last_order_date || null
          };
          console.log('Datos de lealtad cargados:', this.loyaltyInfo);
        }
      },
      error: (err) => {
        // Si hay error, mantenemos los datos predeterminados
        console.error('Error al cargar datos de lealtad:', err);
        // No mostramos notificación para no interrumpir la experiencia
      }
    });
  }

  // Método para obtener el nombre del nivel
  getCurrentLevelName(): string {
    let discount: string;
    
    // Comprobar tipo de dato y convertir adecuadamente
    if (this.loyaltyInfo.discount_percentage === null || this.loyaltyInfo.discount_percentage === undefined) {
      discount = '0';
    } else if (typeof this.loyaltyInfo.discount_percentage === 'string') {
      discount = this.loyaltyInfo.discount_percentage.replace('%', '');
    } else {
      // Si es número, convertirlo directamente a string
      discount = String(this.loyaltyInfo.discount_percentage);
    }
    
    switch (discount) {
      case '0': return 'Standard';
      case '5': return 'Silver';
      case '10': return 'Gold';
      case '15': return 'Platinum';
      default: return 'Cliente';
    }
  }

  // Método para verificar si es nivel máximo
  isMaxLevel(): boolean {
    if (typeof this.loyaltyInfo.discount_percentage === 'string') {
      return this.loyaltyInfo.discount_percentage.includes('15');
    } else {
      // Si es número, comparar directamente
      return this.loyaltyInfo.discount_percentage === 15;
    }
  }

  // Método para obtener porcentaje de progreso
  getLoyaltyProgress(): number {
    let discount: number;
    
    if (typeof this.loyaltyInfo.discount_percentage === 'string') {
      discount = parseInt(this.loyaltyInfo.discount_percentage.replace('%', ''), 10) || 0;
    } else {
      discount = this.loyaltyInfo.discount_percentage || 0;
    }
    
    return Math.min(Math.round((discount / 15) * 100), 100);
  }

  getLevelTextColorClass(): string {
    const level = this.getCurrentLevelName();
    switch (level) {
      case 'Standard': return 'text-gray-300';
      case 'Silver': return 'text-gray-500';
      case 'Gold': return 'text-yellow-300';
      case 'Platinum': return 'text-cyan-300';
      default: return 'text-white';
    }
  }
  
  guardarDatos(): void {
    const id = this.usuario.id;

    // Crear objeto con los campos actualizables
    const updatedUser = {
      email: this.usuario.email,
      first_name: this.usuario.first_name,
      last_name: this.usuario.last_name,
      role: this.usuario.role,
      is_staff: this.usuario.is_staff,
      is_superuser: this.usuario.is_superuser
    };

    this.userService.actualizarUser(id, updatedUser).subscribe({
      next: () => {
        this.noti.success('Datos actualizados', '¡Actualización correcta!');
        localStorage.setItem('user', JSON.stringify(this.usuario)); // actualizar localStorage
        this.modoEdicion = false;
      },
      error: (err) => {
        console.error('Error al actualizar usuario', err);
        this.noti.error('Error', 'No se pudo actualizar el usuario');
      }
    });
  }

  cambiarPassword(form: NgForm): void {
    if (form.invalid) return;

    const data = {
      old_password: this.cambioPassword.oldPassword,
      new_password: this.cambioPassword.newPassword,
    };

    this.userService.changePassword(data).subscribe({
      next: () => {
        this.noti.success('Contraseña actualizada', 'Tu contraseña fue cambiada exitosamente');
        form.resetForm();
        this.mostrarCambioPassword = false;

      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        this.noti.error('Error', 'No se pudo cambiar la contraseña');
      }
    });
  }
  
  cancelarEdicion() {
    this.modoEdicion = false;
    this.usuario = this.authService.getUser(); // Vuelve a cargar los datos guardados
    this.noti.warn('Cancelada', 'Edicion de informacion cancelada');
  }

  cancelarCambioPassword() {
    this.mostrarCambioPassword = false;
    this.cambioPassword = { oldPassword: '', newPassword: '' };
    this.noti.warn('Cancelado', 'Cambio de contraseña cancelado');
  }
}
