import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
} from '../modelos/estadisticas';

@Service()
export class EstadisticasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(desde: string, hasta: string) {
    return firstValueFrom(
      this.http.get<PublicacionesPorUsuario[]>(`${this.url}/publicaciones-por-usuario`, {
        params: this.rango(desde, hasta),
      }),
    );
  }

  comentariosPorDia(desde: string, hasta: string) {
    return firstValueFrom(
      this.http.get<ComentariosPorDia[]>(`${this.url}/comentarios-por-dia`, {
        params: this.rango(desde, hasta),
      }),
    );
  }

  comentariosPorPublicacion(desde: string, hasta: string) {
    return firstValueFrom(
      this.http.get<ComentariosPorPublicacion[]>(`${this.url}/comentarios-por-publicacion`, {
        params: this.rango(desde, hasta),
      }),
    );
  }

  private rango(desde: string, hasta: string) {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}
