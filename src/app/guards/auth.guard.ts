import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('access');

  if (token) {
    return true;
  }

  const router = inject(Router);
  router.navigate(['/ingreso']); // redirige al login
  return false;
};
