import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { TokenGuard } from '../autenticacion/token.guard';
import { AdministradorGuard } from '../autenticacion/administrador.guard';
import type { PedidoConUsuario } from '../autenticacion/token.guard';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService
    ) {}

    @Get()
    @UseGuards(TokenGuard, AdministradorGuard)
    obtenerTodos() {
        return this.usuariosService.obtenerTodos();
    }

    @Post()
    @UseGuards(TokenGuard, AdministradorGuard)
    @UseInterceptors(FileInterceptor('imagenPerfil'))
    crear(
        @Body() datos: CrearUsuarioDto,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        return this.usuariosService.crearDesdeAdministrador(datos, imagen);
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

    @Delete(':id')
    @UseGuards(TokenGuard, AdministradorGuard)
    deshabilitar(@Param('id') id: string, @Req() pedido: PedidoConUsuario) {
        return this.usuariosService.deshabilitar(id, pedido.usuario.sub);
    }

    @Post(':id/habilitar')
    @HttpCode(200)
    @UseGuards(TokenGuard, AdministradorGuard)
    habilitar(@Param('id') id: string) {
        return this.usuariosService.habilitar(id);
    }

}
