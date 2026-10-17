import { Routes } from '@angular/router';

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
    path: 'error',
    loadComponent: () =>
      import('./componentes/error-component/error-component').then((m) => m.ErrorComponent),
  },
  {
    path: '**',
    redirectTo: 'error',
  },
];
