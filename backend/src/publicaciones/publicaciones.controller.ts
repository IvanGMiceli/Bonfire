import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { TokenGuard } from '../autenticacion/token.guard';
import type { PedidoConUsuario } from '../autenticacion/token.guard';

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  crear(
    @Body() datos: CrearPublicacionDto,
    @Req() pedido: PedidoConUsuario,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(datos, pedido.usuario.sub, imagen);
  }

  @Get()
  obtenerTodas(
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('orden') orden?: string,
    @Query('usuario') usuario?: string,
  ) {
    return this.publicacionesService.obtenerTodas(offset, limit, orden, usuario);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id') id: string, @Req() pedido: PedidoConUsuario) {
    return this.publicacionesService.darMeGusta(id, pedido.usuario.sub);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id') id: string, @Req() pedido: PedidoConUsuario) {
    return this.publicacionesService.quitarMeGusta(id, pedido.usuario.sub);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() pedido: PedidoConUsuario) {
    return this.publicacionesService.eliminar(id, pedido.usuario.sub, pedido.usuario.perfil);
  }
}
