import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule para que funcione sin necesidad de un módulo externo

@Component({
  selector: 'app-footer-contact',
  templateUrl: './footer-contact.component.html',
  styleUrls: ['./footer-contact.component.css'],
  standalone: true, // Marca el componente como standalone
  imports: [CommonModule] // Asegura que CommonModule esté disponible para las directivas estándar como ngIf, ngFor, etc.
})
export class FooterContactComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
