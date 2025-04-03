import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-ingreso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso.component.html',
})
export class IngresoComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion() {
    const datos = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(datos).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        console.log('role: ', res.role);
        // Guarda el token
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        localStorage.setItem('user_role', res.role); // <-- esto es clave

        // Redirige al home o dashboard
        this.router.navigate(['/admin']); // Asegúrate de que esa ruta exista
      },
      error: (err) => {
        console.error('Error de login:', err);
      }
    });
  }
}
