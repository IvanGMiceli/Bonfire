import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../modelos/usuario';
import { Registro } from '../modelos/registro';

@Service()
export class UsuariosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar() {
    return firstValueFrom(this.http.get<Usuario[]>(this.url));
  }

  crear(datos: Registro, perfil: Usuario['perfil'], imagen: File | null) {
    const formulario = new FormData();
    formulario.append('nombre', datos.nombre);
    formulario.append('apellido', datos.apellido);
    formulario.append('correo', datos.correo);
    formulario.append('nombreUsuario', datos.nombreUsuario);
    formulario.append('clave', datos.clave);
    formulario.append('repetirClave', datos.repetirClave);
    formulario.append('fechaNacimiento', datos.fechaNacimiento);
    formulario.append('perfil', perfil);
    if (datos.descripcion) {
      formulario.append('descripcion', datos.descripcion);
    }
    if (imagen) {
      formulario.append('imagenPerfil', imagen);
    }
    return firstValueFrom(this.http.post<Usuario>(this.url, formulario));
  }

  deshabilitar(id: string) {
    return firstValueFrom(this.http.delete<Usuario>(`${this.url}/${id}`));
  }

  habilitar(id: string) {
    return firstValueFrom(this.http.post<Usuario>(`${this.url}/${id}/habilitar`, null));
  }
}
