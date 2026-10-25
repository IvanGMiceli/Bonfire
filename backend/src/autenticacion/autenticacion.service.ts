import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly almacenamientoService: AlmacenamientoService,
    private readonly jwtService: JwtService,
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

  async login(datos: LoginDto) {
    const usuario = await this.usuariosService.buscarPorCorreoONombreUsuario(
      datos.correoOUsuario,
      datos.correoOUsuario,
    );
    
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const claveCorrecta = await bcrypt.compare(datos.clave, usuario.clave);
    if (!claveCorrecta) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const token = await this.jwtService.signAsync({
      sub: usuario._id.toString(),
      perfil: usuario.perfil,
    });

    const { clave, ...usuarioSinClave } = usuario.toObject();
    return { usuario: usuarioSinClave, token };
  }

  async autorizar(usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('El usuario del token no existe');
    }
    return usuario;
  }
}
