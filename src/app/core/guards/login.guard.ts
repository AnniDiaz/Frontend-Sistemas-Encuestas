import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = () => {

  const router = inject(Router);

  const rol = localStorage.getItem('rolUsuario');

  if (rol === 'egresado') {
    return router.createUrlTree(['/egresado']);
  }

  if (rol === 'empleador') {
    return router.createUrlTree(['/empleador']);
  }

  if (rol === 'admin') {
    return router.createUrlTree(['/reportes']);
  }

  return true;
};
