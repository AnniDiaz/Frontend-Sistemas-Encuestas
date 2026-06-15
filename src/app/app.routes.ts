import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { adminGuard } from './core/guards/admin.guard';
import { EncuestaResponderComponent } from './features/encuesta-responder/encuesta-responder.component';
export const routes: Routes = [

  // =========================
  // AUTH (SIN GUARD)
  // =========================
  {
    path: 'auth/selector-rol',
    loadComponent: () =>
      import('./features/auth/selector-rol/selector-rol.component')
        .then(m => m.SelectorRolComponent),
    canActivate: [loginGuard]
  },
 {
  path: 'auth/login/:rol',
  loadComponent: () =>
    import('./features/auth/login-dni/login-dni.component')
      .then(m => m.LoginDniComponent),
  canActivate: [loginGuard]
},
  // =========================
  // DASHBOARD EGRESADO (PROTEGIDO)
  // =========================
  {
    path: 'egresado',
    loadComponent: () =>
      import('./features/egresado/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { rol: 'egresado' }
  },
{
  path: 'egresado/encuesta/:id',
  loadComponent: () =>
    import('./features/encuesta-responder/encuesta-responder.component')
      .then(m => m.EncuestaResponderComponent),
  canActivate: [authGuard],
  data: { rol: 'egresado' }
},

{
  path: 'reportes',
  loadComponent: () =>
    import('./features/reportes/reportes.component')
      .then(m => m.ReportesComponent),
  canActivate: [adminGuard]
},

{
  path: 'login/admin',
  loadComponent: () =>
    import('./features/login-admin/login-admin.component')
      .then(m => m.LoginAdminComponent),
  canActivate: [loginGuard]
},
  // =========================
  // DASHBOARD EMPLEADOR (PROTEGIDO)
  // =========================
  {
    path: 'empleador',
    loadComponent: () =>
      import('./features/empleador/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { rol: 'empleador' }
  },
{
  path: 'empleador/encuesta/:id',
  loadComponent: () =>
    import('./features/encuesta-responder/encuesta-responder.component')
      .then(m => m.EncuestaResponderComponent),
  canActivate: [authGuard],
  data: { rol: 'empleador' }
},

  // =========================
  // DEFAULT
  // =========================
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
