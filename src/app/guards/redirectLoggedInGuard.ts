import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const redirectLoggedInGuard: CanActivateFn = () => {
  const token = localStorage.getItem('access');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const router = inject(Router);

  if (token && user?.role) {
    const role = user.role;
    const path = role === 'admin' ? '/admin' : '/customer';
    router.navigate([path]);
    return false;
  }

  return true;
};
