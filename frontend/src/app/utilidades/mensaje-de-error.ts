import { HttpErrorResponse } from '@angular/common/http';

export function mensajeDeError(e: unknown): string {
  
  if (e instanceof HttpErrorResponse) {
    
    const mensaje = e.error?.message;

    if (Array.isArray(mensaje)) {
      return mensaje.join('. ');
    }

    if (typeof mensaje === 'string') {
      return mensaje;
    }

  }

  return 'No se pudo conectar con el servidor';
}
