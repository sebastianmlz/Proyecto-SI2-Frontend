import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  mostrarModal = true;

  usuario = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: '',
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService,
  ) { }
  registrarse() {
    this.authService.registrarse(this.usuario).subscribe({
      next: () => {
        alert('✅ Registro exitoso');
        this.router.navigate(['/ingreso']);
      },
      error: (err) => {
        console.error('❌ Error al registrar:', err);
        alert('Error al registrar usuario');
      }
    });

  }
}
