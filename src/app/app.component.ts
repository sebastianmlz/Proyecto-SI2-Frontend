import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // Solo importar RouterOutlet
import { HeaderComponent } from './componentes/header/header.component';
import { SidebarComponent } from './componentes/sidebar/sidebar.component'; // Importar SidebarComponent
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, SidebarComponent,ToastModule], // Solo RouterOutlet
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Proyecto-Frontend';// Añadido para usar el servicio de autenticación
  visible=false;
  constructor(public authService: AuthService) {}
  
}
