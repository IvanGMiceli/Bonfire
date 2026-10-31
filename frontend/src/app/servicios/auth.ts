import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../modelos/usuario';
import { Registro } from '../modelos/registro';

@Service()
export class Auth {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/autenticacion`;

  usuario = signal<Usuario | null>(null);

  async iniciarSesion(correoOUsuario: string, clave: string): Promise<void> {
    const respuesta = await firstValueFrom(
      this.http.post<{ usuario: Usuario; token: string }>(`${this.url}/login`, {
        correoOUsuario,
        clave,
      }),
    );
    localStorage.setItem('token', respuesta.token);
    this.usuario.set(respuesta.usuario);
  }

  async registrarse(datos: Registro, imagen: File | null): Promise<void> {
    const formulario = new FormData();
    formulario.append('nombre', datos.nombre);
    formulario.append('apellido', datos.apellido);
    formulario.append('correo', datos.correo);
    formulario.append('nombreUsuario', datos.nombreUsuario);
    formulario.append('clave', datos.clave);
    formulario.append('repetirClave', datos.repetirClave);
    formulario.append('fechaNacimiento', datos.fechaNacimiento);
    if (datos.descripcion) {
      formulario.append('descripcion', datos.descripcion);
    }
    if (imagen) {
      formulario.append('imagenPerfil', imagen);
    }
    await firstValueFrom(this.http.post(`${this.url}/registro`, formulario));
  }

  async restaurarSesion(): Promise<void> {
    if (!localStorage.getItem('token')) {
      return;
    }
    try {
      const usuario = await firstValueFrom(this.http.post<Usuario>(`${this.url}/autorizar`, null));
      this.usuario.set(usuario);
    } catch {
      localStorage.removeItem('token');
    }
  }

  async actualizarPerfil(correo: string, nombreUsuario: string, imagen: File | null): Promise<void> {
    const formulario = new FormData();
    formulario.append('correo', correo);
    formulario.append('nombreUsuario', nombreUsuario);
    if (imagen) {
      formulario.append('imagenPerfil', imagen);
    }
    const usuario = await firstValueFrom(
      this.http.patch<Usuario>(`${environment.apiUrl}/usuarios/perfil`, formulario),
    );
    this.usuario.set(usuario);
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.usuario.set(null);
  }
}
