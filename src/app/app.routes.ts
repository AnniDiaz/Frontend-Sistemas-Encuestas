import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/selector-rol',
    loadComponent: () => import('./features/auth/selector-rol/selector-rol.component')
      .then(m => m.SelectorRolComponent)
  },
  {
    path: 'auth/login-dni/:rol',
    loadComponent: () => import('./features/auth/login-dni/login-dni.component')
      .then(m => m.LoginDniComponent)
  },
  {
    path: 'egresado',
    loadComponent: () => import('./features/egresado/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { rol: 'egresado' }
  },
  {
    path: 'empleador',
    loadComponent: () => import('./features/empleador/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { rol: 'empleador' }
  },
  {
    path: '',
    redirectTo: 'auth/selector-rol',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/selector-rol'
  }
];
