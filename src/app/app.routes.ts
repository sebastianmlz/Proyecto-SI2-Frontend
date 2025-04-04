import { Routes } from '@angular/router';
import { IngresoComponent } from './Paginas/ingreso/ingreso.component';
import { HomeComponent } from './Paginas/home/home.component';
import { ProductsComponent } from './Paginas/products/products.component';
import { RegistroComponent } from './Paginas/registers/registro.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'ingreso', component: IngresoComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'admin',
    loadComponent: () => import('./Paginas/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'Productos',
    component: ProductsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'customer',
    loadComponent: () => import('./Paginas/customers/customers.component').then(m => m.CustomersComponent),
    canActivate: [authGuard]
  },
  { path: 'Home', component: HomeComponent },
  { path: '**', component: IngresoComponent },
];
