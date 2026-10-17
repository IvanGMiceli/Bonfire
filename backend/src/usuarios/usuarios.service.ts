import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(   
  @InjectModel(Usuario.name) 
  private readonly usuarioModel: Model<UsuarioDocument>
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
}
