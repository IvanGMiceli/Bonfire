import { Body, Controller, Get, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { TokenGuard } from '../autenticacion/token.guard';
import type { PedidoConUsuario } from '../autenticacion/token.guard';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

@Controller('usuarios')
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService
    ) {}

    @Get()
    @UseGuards(TokenGuard)
    obtenerTodos() {
        return this.usuariosService.obtenerTodos();
    }

    @Patch('perfil')
    @UseGuards(TokenGuard)
    @UseInterceptors(FileInterceptor('imagenPerfil'))
    actualizarPerfil(
        @Body() datos: ActualizarPerfilDto,
        @Req() pedido: PedidoConUsuario,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        return this.usuariosService.actualizarPerfil(pedido.usuario.sub, datos, imagen);
    }

}
