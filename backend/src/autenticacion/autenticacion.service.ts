import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(datos: RegistroDto, imagen?: Express.Multer.File) {
    const usuario = await this.usuariosService.registrar(datos, imagen);
    return this.respuestaConToken(usuario);
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

    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Comunicate con un administrador');
    }

    return this.respuestaConToken(usuario);
  }

  private async respuestaConToken(usuario: UsuarioDocument) {
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

  async refrescar(usuarioId: string, perfil: string) {
    const token = await this.jwtService.signAsync({ sub: usuarioId, perfil });
    return { token };
  }
}
