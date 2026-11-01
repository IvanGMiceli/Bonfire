import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentarioDto } from './dto/comentario.dto';
import { TokenGuard } from '../autenticacion/token.guard';
import type { PedidoConUsuario } from '../autenticacion/token.guard';

@Controller()
@UseGuards(TokenGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post('publicaciones/:id/comentarios')
  crear(@Param('id') id: string, @Body() datos: ComentarioDto, @Req() pedido: PedidoConUsuario) {
    return this.comentariosService.crear(id, pedido.usuario.sub, datos);
  }

  @Get('publicaciones/:id/comentarios')
  obtenerDePublicacion(
    @Param('id') id: string,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.comentariosService.obtenerDePublicacion(id, offset, limit);
  }

  @Put('comentarios/:id')
  modificar(@Param('id') id: string, @Body() datos: ComentarioDto, @Req() pedido: PedidoConUsuario) {
    return this.comentariosService.modificar(id, pedido.usuario.sub, datos);
  }
}
