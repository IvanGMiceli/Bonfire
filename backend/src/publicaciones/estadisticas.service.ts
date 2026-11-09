import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';

const ZONA_HORARIA = '-03:00';
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
  ) {}

  async publicacionesPorUsuario(desde?: string, hasta?: string) {
    const { inicio, fin } = this.armarRango(desde, hasta);

    return this.publicacionModel.aggregate<{ nombreUsuario: string; cantidad: number }>([
      { $match: { activo: true, createdAt: { $gte: inicio, $lt: fin } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $project: { _id: 0, nombreUsuario: '$usuario.nombreUsuario', cantidad: 1 } },
      { $sort: { cantidad: -1 } },
    ]);
  }

  async comentariosPorDia(desde?: string, hasta?: string) {
    const { inicio, fin } = this.armarRango(desde, hasta);

    const resultado = await this.comentarioModel.aggregate<{ _id: string; cantidad: number }>([
      { $match: { createdAt: { $gte: inicio, $lt: fin } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA_HORARIA } },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const cantidadPorDia = new Map(resultado.map((fila) => [fila._id, fila.cantidad]));

    const dias: { dia: string; cantidad: number }[] = [];
    for (const dia = new Date(inicio); dia < fin; dia.setUTCDate(dia.getUTCDate() + 1)) {
      const clave = dia.toISOString().slice(0, 10);
      dias.push({ dia: clave, cantidad: cantidadPorDia.get(clave) ?? 0 });
    }

    return dias;
  }

  async comentariosPorPublicacion(desde?: string, hasta?: string) {
    const { inicio, fin } = this.armarRango(desde, hasta);

    return this.comentarioModel.aggregate<{ titulo: string; cantidad: number }>([
      { $match: { createdAt: { $gte: inicio, $lt: fin } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.publicacionModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      { $match: { 'publicacion.activo': true } },
      { $project: { _id: 0, titulo: '$publicacion.titulo', cantidad: 1 } },
      { $sort: { cantidad: -1 } },
    ]);
  }

  private armarRango(desde?: string, hasta?: string) {
    if (!desde || !hasta) {
      throw new BadRequestException('Elegí las fechas desde y hasta');
    }

    if (!FORMATO_FECHA.test(desde) || !FORMATO_FECHA.test(hasta)) {
      throw new BadRequestException('Las fechas deben tener el formato AAAA-MM-DD');
    }

    const inicio = new Date(`${desde}T00:00:00${ZONA_HORARIA}`);
    const fin = new Date(`${hasta}T00:00:00${ZONA_HORARIA}`);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas no son válidas');
    }

    if (inicio > fin) {
      throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
    }

    fin.setUTCDate(fin.getUTCDate() + 1);

    return { inicio, fin };
  }
}
