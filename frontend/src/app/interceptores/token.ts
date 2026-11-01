import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../servicios/auth';

export const tokenInterceptor: HttpInterceptorFn = (pedido, siguiente) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = localStorage.getItem('token');

  let pedidoFinal = pedido;
  if (token) {
    pedidoFinal = pedido.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return siguiente(pedidoFinal).pipe(
    catchError((error: unknown) => {
      const esLogin = pedido.url.endsWith('/autenticacion/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && !esLogin) {
        auth.cerrarSesion();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
