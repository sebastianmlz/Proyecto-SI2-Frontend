import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
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
    actual: '',
    nueva: '',
    confirmar: '',
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

  guardarCambiosPerfil() {
    const data = {
      email: this.usuario.email,
      first_name: this.usuario.first_name,
      last_name: this.usuario.last_name,
      role: this.usuario.role,
      active: true
    };
  
    this.userService.actualizarPerfil(this.usuario.id, data).subscribe({
      next: () => {
        // ✅ Actualiza localStorage con los nuevos datos
        localStorage.setItem('user', JSON.stringify(this.usuario));
  
        // ✅ Actualiza objeto local (por si usas `getUser()` en otras partes)
        this.usuario = this.authService.getUser();
  
        // ✅ Notificación y UI
        this.noti.success('Perfil actualizado', 'Tus datos han sido guardados exitosamente');
  
        // ✅ Finaliza edición
        this.modoEdicion = false;
      },
      error: (err) => {
        console.error('Error al actualizar perfil', err);
        this.noti.error('Error', 'No se pudo actualizar tu perfil');
      }
    });
  }
  
  

  guardarNuevaPassword() {
    const { actual, nueva, confirmar } = this.cambioPassword;
  
    if (!actual || !nueva || !confirmar) {
      this.noti.error('Error', 'Todos los campos son obligatorios');
      return;
    }
  
    if (nueva !== confirmar) {
      this.noti.error('Error', 'La nueva contraseña no coincide con la confirmación');
      return;
    }
  
    const datos = {
      old_password: actual,
      new_password: nueva,
      confirm_password: confirmar
    };
  
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.post(`${this.baseUrl}/auth/change-password`, datos, { headers }).subscribe({
      next: () => {
        this.noti.success('Actualizada', 'Contraseña correctamente actualizada');
        this.cambioPassword = { actual: '', nueva: '', confirmar: '' };
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
    this.cambioPassword = { actual: '', nueva: '', confirmar: '' };
    this.noti.warn('Cancelado', 'Cambio de contraseña cancelado');
  }
}
