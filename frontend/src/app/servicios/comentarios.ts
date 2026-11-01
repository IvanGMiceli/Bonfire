import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario } from '../modelos/comentario';

@Service()
export class ComentariosService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  listar(publicacionId: string, offset: number, limit: number) {
    const parametros = new HttpParams().set('offset', offset).set('limit', limit);
    return firstValueFrom(
      this.http.get<Comentario[]>(`${this.url}/publicaciones/${publicacionId}/comentarios`, {
        params: parametros,
      }),
    );
  }

  crear(publicacionId: string, mensaje: string) {
    return firstValueFrom(
      this.http.post<Comentario>(`${this.url}/publicaciones/${publicacionId}/comentarios`, { mensaje }),
    );
  }

  modificar(id: string, mensaje: string) {
    return firstValueFrom(this.http.put<Comentario>(`${this.url}/comentarios/${id}`, { mensaje }));
  }
}
