import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
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
}
