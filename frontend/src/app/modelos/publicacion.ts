export interface AutorPublicacion {
  _id: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  autor: AutorPublicacion;
  meGusta: string[];
  cantidadMeGusta: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';
