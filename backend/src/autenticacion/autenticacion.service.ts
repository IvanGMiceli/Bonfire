import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RegistroDto } from './dto/registro.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly almacenamientoService: AlmacenamientoService,
  ) {}

  async registro(datos: RegistroDto, imagen?: Express.Multer.File) {
    if (datos.clave !== datos.repetirClave) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existente = await this.usuariosService.buscarPorCorreoONombreUsuario(
      datos.correo,
      datos.nombreUsuario,
    );

    if (existente?.correo === datos.correo.toLowerCase()) {
      throw new BadRequestException('El correo ya está registrado');
    }
    
    if (existente) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const claveHasheada = await bcrypt.hash(datos.clave, 10);

    let imagenPerfil: string | undefined;
    if (imagen) {
      imagenPerfil = await this.almacenamientoService.subirImagen(imagen, 'perfiles');
    }

    await this.usuariosService.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombreUsuario: datos.nombreUsuario,
      clave: claveHasheada,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      descripcion: datos.descripcion,
      imagenPerfil,
    });

    return { mensaje: 'Usuario registrado' };
  }
}
