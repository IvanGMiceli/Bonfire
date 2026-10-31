import {  Body,  Controller,  HttpCode,  Post,  Req,  UploadedFile,  UseGuards,  UseInterceptors,} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { TokenGuard } from './token.guard';
import type { PedidoConUsuario } from './token.guard';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registro( @Body() datos: RegistroDto, @UploadedFile() imagen: Express.Multer.File  ) {
    return this.autenticacionService.registro(datos, imagen);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() datos: LoginDto) {
    return this.autenticacionService.login(datos);
  }

  @Post('autorizar')
  @HttpCode(200)
  @UseGuards(TokenGuard)
  autorizar(@Req() pedido: PedidoConUsuario) {
    return this.autenticacionService.autorizar(pedido.usuario.sub);
  }

  @Post('refrescar')
  @HttpCode(200)
  @UseGuards(TokenGuard)
  refrescar(@Req() pedido: PedidoConUsuario) {
    return this.autenticacionService.refrescar(pedido.usuario.sub, pedido.usuario.perfil);
  }
}
