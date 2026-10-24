import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { TokenGuard } from '../autenticacion/token.guard';

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

}
