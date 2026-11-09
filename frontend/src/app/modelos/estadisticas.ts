export interface PublicacionesPorUsuario {
  nombreUsuario: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  dia: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  titulo: string;
  cantidad: number;
}
