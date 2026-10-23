import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (pedido, siguiente) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return siguiente(pedido);
  }

  const pedidoConToken = pedido.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return siguiente(pedidoConToken);
};
