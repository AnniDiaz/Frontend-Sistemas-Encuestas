import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);

  const rol = localStorage.getItem('rolUsuario');

  if (rol === 'admin') {
    return true;
  }

  return router.createUrlTree([
    '/auth/selector-rol'
  ]);
};
