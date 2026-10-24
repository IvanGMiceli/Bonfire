import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
}
