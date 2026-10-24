import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
  obtenerTodas() {
    return this.publicacionesService.obtenerTodas();
  }
}
