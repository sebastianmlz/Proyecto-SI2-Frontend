import { Routes } from '@angular/router';
import { IngresoComponent } from './Paginas/ingreso/ingreso.component';
import { HomeComponent } from './Paginas/home/home.component';
import { ProductsComponent } from './Paginas/products/products.component';


export const routes: Routes = [
  { path: 'ingreso', component: IngresoComponent },
  { path: 'Productos', component: ProductsComponent },
  { path: 'Home', component: HomeComponent },
  { path: '**', component: HomeComponent }
];
