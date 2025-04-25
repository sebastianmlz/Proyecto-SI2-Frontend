import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificacionService } from '../../services/notificacion.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ingreso',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './ingreso.component.html',
  providers: [MessageService]
})
export class IngresoComponent {
  email = '';
  password = '';
  private messageService = inject(MessageService);

  constructor(
    private authService: AuthService,
    private router: Router,
    private noti: NotificacionService
  ) {}

  ngOnInit() {
    const reason = localStorage.getItem('logout_reason');
    if (reason) {
      this.noti.warn('Atención', reason);
      localStorage.removeItem('logout_reason');
    }
    //manera de enviar un mensaje
    // this.noti.success('¡Registro completo!', 'Ahora podés iniciar sesión');

  }

  iniciarSesion() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log("Respuesta completa del login:", res);
  
        // Guardamos los tokens primero
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
  
        const userId = res.id;
  
        // Pedimos los datos completos del usuario
        this.authService.getUserById(userId).subscribe({
          next: (userData) => {
            // Guardamos el usuario en localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('user_role', userData.role); // opcional
            
            // ✅ Actualizamos el usuario global
            this.authService.actualizarUsuario(); // 🔥 Esta línea es nueva
        
            console.log("Usuario obtenido:", userData);
  
            // Redirigir dependiendo del rol
            if (userData.role === 'admin') {
              this.router.navigate(['/productos']);
            } else if (userData.role === 'customer') {
              this.router.navigate(['/productos']);
            } else {
              this.router.navigate(['/']);
            }
            
          },
          error: (err) => {
            console.error('Error al obtener usuario:', err);
            alert('No se pudo cargar el perfil del usuario.');
  
            // ⚠️ Limpieza por seguridad
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_role');
  
            this.router.navigate(['/ingreso']);
          }
        });
      },
      error: (err) => {
        console.error('Error en login:', err);
        alert('Credenciales inválidas.');
      }
    });
  }
  
}
