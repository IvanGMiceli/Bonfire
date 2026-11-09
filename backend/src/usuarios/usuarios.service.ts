import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { RegistroDto } from '../autenticacion/dto/registro.dto';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';

@Injectable()
export class UsuariosService {
  constructor(   
  @InjectModel(Usuario.name) 
  private readonly usuarioModel: Model<UsuarioDocument>,
  private readonly almacenamientoService: AlmacenamientoService,
  ) {}

  async obtenerTodos() {
    return this.usuarioModel.find().select('-clave').exec();
  }

  async buscarPorCorreoONombreUsuario(correo: string, nombreUsuario: string) {
    return this.usuarioModel.findOne({ $or: [{ correo: correo.toLowerCase() }, { nombreUsuario }] }).exec();
  }

  async crear(datos: Partial<Usuario>) {
    return this.usuarioModel.create(datos);
  }

  async registrar(datos: RegistroDto, imagen?: Express.Multer.File, perfil = 'usuario') {
    if (datos.clave !== datos.repetirClave) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existente = await this.buscarPorCorreoONombreUsuario(datos.correo, datos.nombreUsuario);

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

    return this.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombreUsuario: datos.nombreUsuario,
      clave: claveHasheada,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      descripcion: datos.descripcion,
      imagenPerfil,
      perfil,
    });
  }

  async crearDesdeAdministrador(datos: CrearUsuarioDto, imagen?: Express.Multer.File) {
    const usuario = await this.registrar(datos, imagen, datos.perfil);
    const { clave, ...usuarioSinClave } = usuario.toObject();
    return usuarioSinClave;
  }

  async buscarPorId(id: string) {
    return this.usuarioModel.findById(id).select('-clave').exec();
  }

  async actualizarPerfil(id: string, datos: ActualizarPerfilDto, imagen?: Express.Multer.File) {
    const correo = datos.correo?.trim().toLowerCase();
    const nombreUsuario = datos.nombreUsuario?.trim();

    if (!correo && !nombreUsuario && !imagen) {
      throw new BadRequestException('No hay cambios para guardar');
    }

    const condiciones: { correo?: string; nombreUsuario?: string }[] = [];
    if (correo) {
      condiciones.push({ correo });
    }
    if (nombreUsuario) {
      condiciones.push({ nombreUsuario });
    }

    if (condiciones.length > 0) {
      const otro = await this.usuarioModel.findOne({ _id: { $ne: id }, $or: condiciones }).exec();
      if (otro?.correo === correo) {
        throw new BadRequestException('El correo ya está registrado');
      }
      if (otro) {
        throw new BadRequestException('El nombre de usuario ya está en uso');
      }
    }

    const cambios: Partial<Usuario> = {};
    if (correo) {
      cambios.correo = correo;
    }
    if (nombreUsuario) {
      cambios.nombreUsuario = nombreUsuario;
    }
    if (imagen) {
      cambios.imagenPerfil = await this.almacenamientoService.subirImagen(imagen, 'perfiles');
    }

    return this.usuarioModel
      .findByIdAndUpdate(id, { $set: cambios }, { returnDocument: 'after', runValidators: true })
      .select('-clave')
      .exec();
  }

  async deshabilitar(id: string, adminId: string) {
    if (id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }
    return this.cambiarEstado(id, false);
  }

  async habilitar(id: string) {
    return this.cambiarEstado(id, true);
  }

  private async cambiarEstado(id: string, activo: boolean) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('El usuario no es válido');
    }

    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { $set: { activo } }, { returnDocument: 'after' })
      .select('-clave')
      .exec();

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    return usuario;
  }
}
