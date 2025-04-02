import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // Solo importar RouterOutlet
import { IngresoComponent } from './Paginas/ingreso/ingreso.component';
import { HeaderComponent } from './componentes/header/header.component';
import { FooterContactComponent } from './componentes/footer-contact/footer-contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterContactComponent], // Solo RouterOutlet
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Proyecto-Frontend';
}
