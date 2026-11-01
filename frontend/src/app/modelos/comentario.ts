import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  mensaje: string;
  publicacion: string;
  autor: AutorPublicacion;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}
