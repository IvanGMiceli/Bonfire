import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrdenPublicaciones, Publicacion } from '../modelos/publicacion';

@Service()
export class PublicacionesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/publicaciones`;

  listar(offset: number, limit: number, orden: OrdenPublicaciones, usuario?: string) {
    let parametros = new HttpParams()
      .set('offset', offset)
      .set('limit', limit)
      .set('orden', orden);
    if (usuario) {
      parametros = parametros.set('usuario', usuario);
    }
    return firstValueFrom(this.http.get<Publicacion[]>(this.url, { params: parametros }));
  }

  crear(titulo: string, mensaje: string, imagen: File | null) {
    const formulario = new FormData();
    formulario.append('titulo', titulo);
    formulario.append('mensaje', mensaje);
    if (imagen) {
      formulario.append('imagen', imagen);
    }
    return firstValueFrom(this.http.post<Publicacion>(this.url, formulario));
  }

  darMeGusta(id: string) {
    return firstValueFrom(this.http.post<Publicacion>(`${this.url}/${id}/me-gusta`, null));
  }

  quitarMeGusta(id: string) {
    return firstValueFrom(this.http.delete<Publicacion>(`${this.url}/${id}/me-gusta`));
  }

  eliminar(id: string) {
    return firstValueFrom(this.http.delete<{ mensaje: string }>(`${this.url}/${id}`));
  }
}
