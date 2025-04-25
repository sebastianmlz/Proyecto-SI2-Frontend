import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ⬅️ Esto es clave
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NotificacionService } from '../../services/notificacion.service';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-configuracion',
  standalone: true,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
  imports: [
    CommonModule,        // ✅ Asegúrate de tener esto
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
    oldPassword : '',
    newPassword : ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient,
    private noti: NotificacionService
  ) { }

  ngOnInit() {
    this.usuario = this.authService.getUser();
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
