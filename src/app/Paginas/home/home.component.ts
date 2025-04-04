import { Component } from '@angular/core';
import { FooterContactComponent } from '../../componentes/footer-contact/footer-contact.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterContactComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
