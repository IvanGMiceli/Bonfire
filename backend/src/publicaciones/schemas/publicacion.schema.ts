import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop()
  imagen: string;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: Usuario.name, default: [] })
  meGusta: Types.ObjectId[];

  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: true })
  activo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
