import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const router = inject(Router);

  const rolActual =
    localStorage.getItem('rolUsuario');

  const rolRequerido =
    route.data['rol'];

  if (!rolActual) {
    return router.createUrlTree([
      '/auth/selector-rol'
    ]);
  }

  if (rolActual !== rolRequerido) {

    if (rolActual === 'admin') {
      return router.createUrlTree(['/reportes']);
    }

    if (rolActual === 'egresado') {
      return router.createUrlTree(['/egresado']);
    }

    if (rolActual === 'empleador') {
      return router.createUrlTree(['/empleador']);
    }
  }

  return true;
};
