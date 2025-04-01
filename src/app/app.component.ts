import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';



import { HeaderComponent } from './componentes/header/header.component';
import { FooterContactComponent } from './componentes/footer-contact/footer-contact.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent ,FooterContactComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Proyecto-Frontend';
}
