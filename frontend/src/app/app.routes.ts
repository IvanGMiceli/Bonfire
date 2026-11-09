import { Routes } from '@angular/router';
import { administradorGuard } from './guardias/administrador';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'publicaciones',
    pathMatch: 'full',
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./componentes/publicaciones/publicaciones').then((m) => m.Publicaciones),
  },
  {
    path: 'publicacion/:id',
    loadComponent: () =>
      import('./componentes/detalle-publicacion/detalle-publicacion').then((m) => m.DetallePublicacion),
  },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./componentes/perfil/perfil').then((m) => m.Perfil),
  },
  {
    path: 'dashboard/usuarios',
    canActivate: [administradorGuard],
    loadComponent: () =>
      import('./componentes/dashboard-usuarios/dashboard-usuarios').then((m) => m.DashboardUsuarios),
  },
  {
    path: 'dashboard/estadisticas',
    canActivate: [administradorGuard],
    loadComponent: () =>
      import('./componentes/dashboard-estadisticas/dashboard-estadisticas').then(
        (m) => m.DashboardEstadisticas,
      ),
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./componentes/error-component/error-component').then((m) => m.ErrorComponent),
  },
  {
    path: '**',
    redirectTo: 'error',
  },
];
