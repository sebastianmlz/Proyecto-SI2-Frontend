import { Routes } from '@angular/router';
import { IngresoComponent } from './Paginas/ingreso/ingreso.component';
import { HomeComponent } from './Paginas/home/home.component';
import { ProductsComponent } from './Paginas/products/products.component';
import { RegistroComponent } from './Paginas/registers/registro.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { customerGuard } from './guards/customer.guard';
import { deliveryGuard } from './guards/delivery.guard';
import { redirectLoggedInGuard } from './guards/redirectLoggedInGuard';
import { FeedbackComponent } from './Paginas/feedback/feedback.component';

export const routes: Routes = [
  // Público
  { path: '', redirectTo: 'ingreso', pathMatch: 'full' },
  { path: 'ingreso', component: IngresoComponent, canActivate: [redirectLoggedInGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [redirectLoggedInGuard] },
  { path: 'Home', component: HomeComponent },
  { path: 'Feedback', component: FeedbackComponent },

  // Rutas comunes protegidas
  { path: 'productos', component: ProductsComponent, canActivate: [authGuard] },
  {
    path: 'configuracion',
    loadComponent: () => import('./Paginas/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recomendaciones',
    loadComponent: () => import('./Paginas/recomendaciones/recomendaciones.component').then((m) => m.ProductosRecomendacionesComponent),
    canActivate: [authGuard],
  },

  // Admin
  {
    path: 'admin',
    loadComponent: () => import('./Paginas/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/gestion-usuarios',
    loadComponent: () => import('./Paginas/admin/gestion-usuarios/gestion-usuarios.component').then((m) => m.GestionUsuariosComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/gestion-productos',
    loadComponent: () => import('./Paginas/admin/gestion-productos/gestion-productos.component').then((m) => m.GestionProductosComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/gestion-ventas',
    loadComponent: () => import('./Paginas/admin/gestion-ventas/gestion-ventas.component').then((m) => m.GestionVentasComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/bitacora',
    loadComponent: () => import('./Paginas/admin/bitacora/bitacora.component').then((m) => m.BitacoraComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/reportes',
    loadComponent: () => import('./Paginas/admin/reportes/reportes.component').then((m) => m.ReportesComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/Mensajes',
    loadComponent: () => import('./Paginas/admin/messages/messages.component').then((m) => m.MessagesComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/backup-restore',
    loadComponent: () => import('./Paginas/admin/backup-restore/backup-restore.component').then((m) => m.BackupRestoreComponent),
    canActivate: [adminGuard],
  },

  // Customer
  {
    path: 'customer',
    loadComponent: () => import('./Paginas/customer/customer.component').then((m) => m.CustomerComponent),
    canActivate: [customerGuard],
  },
  {
    path: 'customer/historial-pedidos',
    loadComponent: () => import('./Paginas/customer/historial-pedidos/historial-pedidos.component').then((m) => m.HistorialPedidosComponent),
    canActivate: [customerGuard],
  },
  {
    path: 'customer/carrito',
    loadComponent: () => import('./Paginas/customer/carrito/carrito.component').then((m) => m.CarritoComponent),
    canActivate: [customerGuard],
  },
  {
    path: 'customer/seguimiento',
    loadComponent: () => import('./Paginas/customer/seguimiento/seguimiento.component').then((m) => m.SeguimientoComponent),
    canActivate: [customerGuard],
  },
  {
    path: 'customer/soporte',
    loadComponent: () => import('./Paginas/customer/soporte/soporte.component').then((m) => m.SoporteComponent),
    canActivate: [customerGuard],
  },

  //Delivery
  {
    path: 'delivery',
    loadComponent: () => import('./Paginas/delivery/delivery.component').then((m) => m.DeliveryComponent),
    canActivate: [deliveryGuard],
  },
  {
    path: 'delivery/pedidos-asignados',
    loadComponent: () => import('./Paginas/delivery/pedidos-asignados/pedidos-asignados.component')
    .then((m) => m.PedidosAsignadosComponent),
    canActivate: [deliveryGuard],
  },

  // Wildcard
  { path: '**', redirectTo: 'ingreso' },
];
