import { Routes } from '@angular/router';
import { IngresoComponent } from './Paginas/ingreso/ingreso.component';
import { HomeComponent } from './Paginas/home/home.component';
export const routes: Routes = [
    { path: 'ingreso', component: IngresoComponent },
    { path: '**', component: HomeComponent }
  // Otras rutas que puedas tener...
];
