import { BadRequestException, Injectable } from '@nestjs/common';
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
}
