import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { ProductWithInventory } from '../../models/producto-inventario.model';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CardModule, ButtonModule, RatingModule, CommonModule, FormsModule],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {


  constructor(public authservice: AuthService) { }


  @Input() producto!: ProductWithInventory;
}
