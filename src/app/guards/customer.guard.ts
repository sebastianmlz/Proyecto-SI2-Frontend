import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
export const customerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  const user = authService.getUser();

  if (user && user.role === 'customer') {
    return true;
  }

  localStorage.setItem('logout_reason', 'No tenés permiso para acceder a esta ruta.');
  authService.logout();

  messageService.add({
    severity: 'warn',
    summary: 'Acceso no autorizado',
    detail: 'Tu sesión se ha cerrado automáticamente',
    life: 4000
  });

  router.navigate(['/ingreso']);
  return false;
};
