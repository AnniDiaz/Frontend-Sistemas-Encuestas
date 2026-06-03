import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EncuestaStateService } from '../services/encuesta-state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const stateService = inject(EncuestaStateService);
  const router = inject(Router);

  if (stateService.isAuthenticated()) {
    const expectedRol = route.data?.['rol'];
    if (expectedRol && stateService.currentUserRol() !== expectedRol) {
      // Si el rol no coincide con el esperado, redirige a la selección de rol
      router.navigate(['/auth/selector-rol']);
      return false;
    }
    return true;
  }

  router.navigate(['/auth/selector-rol']);
  return false;
};
