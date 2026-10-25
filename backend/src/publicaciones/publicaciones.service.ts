import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    private readonly almacenamientoService: AlmacenamientoService,
  ) {}

  async crear(datos: CrearPublicacionDto, autorId: string, imagen?: Express.Multer.File) {
    let urlImagen: string | undefined;
    if (imagen) {
      urlImagen = await this.almacenamientoService.subirImagen(imagen, 'publicaciones');
    }

    return this.publicacionModel.create({
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      imagen: urlImagen,
      autor: new Types.ObjectId(autorId),
    });
  }

  async obtenerTodas(offset = 0, limit = 5, orden?: string, usuario?: string) {
    if (offset < 0 || limit < 1) {
      throw new BadRequestException('El offset no puede ser negativo y el limit debe ser al menos 1');
    }

    if (orden && orden !== 'fecha' && orden !== 'meGusta') {
      throw new BadRequestException('El orden debe ser fecha o meGusta');
    }

    if (usuario && !Types.ObjectId.isValid(usuario)) {
      throw new BadRequestException('El usuario no es válido');
    }

    const filtro: { activo: boolean; autor?: Types.ObjectId } = { activo: true };
    if (usuario) {
      filtro.autor = new Types.ObjectId(usuario);
    }

    const criterio: Record<string, SortOrder> =
      orden === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 };

    return this.publicacionModel
      .find(filtro)
      .sort(criterio)
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();
  }

  async darMeGusta(id: string, usuarioId: string) {
    this.validarId(id);
    const usuario = new Types.ObjectId(usuarioId);

    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, activo: true, meGusta: { $ne: usuario } },
        { $addToSet: { meGusta: usuario }, $inc: { cantidadMeGusta: 1 } },
        { returnDocument: 'after' },
      )
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();

    if (!publicacion) {
      await this.verificarQueExiste(id);
      throw new BadRequestException('Ya le diste me gusta a esta publicación');
    }

    return publicacion;
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    this.validarId(id);
    const usuario = new Types.ObjectId(usuarioId);

    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, activo: true, meGusta: usuario },
        { $pull: { meGusta: usuario }, $inc: { cantidadMeGusta: -1 } },
        { returnDocument: 'after' },
      )
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();

    if (!publicacion) {
      await this.verificarQueExiste(id);
      throw new BadRequestException('No le habías dado me gusta a esta publicación');
    }

    return publicacion;
  }

  async eliminar(id: string, usuarioId: string, perfil: string) {
    this.validarId(id);

    const publicacion = await this.publicacionModel.findOne({ _id: id, activo: true }).exec();
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }

    const esAutor = publicacion.autor.toString() === usuarioId;
    const esAdministrador = perfil === 'administrador';
    if (!esAutor && !esAdministrador) {
      throw new ForbiddenException('Solo el autor o un administrador puede eliminar esta publicación');
    }

    publicacion.activo = false;
    await publicacion.save();

    return { mensaje: 'Publicación eliminada' };
  }

  private validarId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('La publicación no es válida');
    }
  }

  private async verificarQueExiste(id: string) {
    const existe = await this.publicacionModel.exists({ _id: id, activo: true });
    if (!existe) {
      throw new NotFoundException('La publicación no existe');
    }
  }
}
