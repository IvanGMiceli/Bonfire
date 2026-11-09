import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

export const administradorGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  await auth.restaurarSesion();
  const usuario = auth.usuario();

  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  if (usuario.perfil !== 'administrador') {
    return router.createUrlTree(['/publicaciones']);
  }

  return true;
};
