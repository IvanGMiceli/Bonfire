import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { PedidoConUsuario } from './token.guard';

@Injectable()
export class AdministradorGuard implements CanActivate {
  canActivate(contexto: ExecutionContext): boolean {
    const pedido = contexto.switchToHttp().getRequest<PedidoConUsuario>();

    if (pedido.usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede realizar esta acción');
    }

    return true;
  }
}
