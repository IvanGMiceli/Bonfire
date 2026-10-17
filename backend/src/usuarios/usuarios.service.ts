import { Injectable } from '@nestjs/common';

@Injectable()
export class UsuariosService {
    private usuarios = [
        { id: 1, nombre: 'Solaire' },
        { id: 2, nombre: 'Guts' }
    ];

    obtenerTodos() {
        return this.usuarios;
    }
}

