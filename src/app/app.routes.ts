import { Routes } from '@angular/router';
import { IngresoComponent } from './Paginas/ingreso/ingreso.component';
import { HomeComponent } from './Paginas/home/home.component';
import { ProductsComponent } from './Paginas/products/products.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'ingreso', component: IngresoComponent },
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
  // {
  //   path: 'customer',
  //   loadComponent: () => import('./Paginas/customer/customer.component').then(m => m.CustomerComponent),
  //   canActivate: [authGuard]
  // },
  { path: 'Home', component: HomeComponent },
  { path: '**', component: HomeComponent }
];
