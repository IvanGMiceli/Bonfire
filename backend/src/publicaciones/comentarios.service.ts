import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { ComentarioDto } from './dto/comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
  ) {}

  async crear(publicacionId: string, autorId: string, datos: ComentarioDto) {
    this.validarId(publicacionId, 'La publicación no es válida');
    await this.verificarPublicacion(publicacionId);

    const comentario = await this.comentarioModel.create({
      mensaje: datos.mensaje,
      publicacion: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(autorId),
    });

    return comentario.populate('autor', 'nombreUsuario imagenPerfil');
  }

  async obtenerDePublicacion(publicacionId: string, offset = 0, limit = 5) {
    if (offset < 0 || limit < 1) {
      throw new BadRequestException('El offset no puede ser negativo y el limit debe ser al menos 1');
    }

    this.validarId(publicacionId, 'La publicación no es válida');
    await this.verificarPublicacion(publicacionId);

    return this.comentarioModel
      .find({ publicacion: new Types.ObjectId(publicacionId) })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();
  }

  async modificar(id: string, usuarioId: string, datos: ComentarioDto) {
    this.validarId(id, 'El comentario no es válido');

    const comentario = await this.comentarioModel.findById(id).exec();
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    await this.verificarPublicacion(comentario.publicacion.toString());

    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('Solo el autor puede editar este comentario');
    }

    comentario.mensaje = datos.mensaje;
    comentario.modificado = true;
    await comentario.save();

    return comentario.populate('autor', 'nombreUsuario imagenPerfil');
  }

  private validarId(id: string, mensaje: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(mensaje);
    }
  }

  private async verificarPublicacion(publicacionId: string) {
    const existe = await this.publicacionModel.exists({ _id: publicacionId, activo: true });
    if (!existe) {
      throw new NotFoundException('La publicación no existe');
    }
  }
}
