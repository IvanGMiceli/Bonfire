import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface PayloadToken {
  sub: string;
  perfil: string;
}

export type PedidoConUsuario = Request & { usuario: PayloadToken };

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const pedido = contexto.switchToHttp().getRequest<PedidoConUsuario>();
    const [tipo, token] = pedido.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de acceso');
    }

    try {
      pedido.usuario = await this.jwtService.verifyAsync<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('El token no es válido o está vencido');
    }

    return true;
  }
}
