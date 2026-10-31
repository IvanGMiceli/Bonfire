import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormField, email, form, required } from '@angular/forms/signals';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { Auth } from '../../servicios/auth';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Publicacion } from '../../modelos/publicacion';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';

@Component({
  imports: [DatePipe, FormField, TarjetaPublicacion],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})

export class Perfil implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  protected auth = inject(Auth);

  ultimas = signal<Publicacion[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  editando = signal(false);
  guardando = signal(false);
  errorEdicion = signal<string | null>(null);
  exito = signal<string | null>(null);
  imagenNueva = signal<File | null>(null);

  modeloEdicion = signal({ correo: '', nombreUsuario: '' });

  formularioEdicion = form(this.modeloEdicion, (campo) => {
    required(campo.correo, { message: 'El correo es obligatorio' });
    email(campo.correo, { message: 'Ingresá un correo válido' });
    required(campo.nombreUsuario, { message: 'El nombre de usuario es obligatorio' });
  });

  ngOnInit() {
    this.cargarUltimas();
  }

  async cargarUltimas() {
    const miId = this.auth.usuario()?._id;
    if (!miId) {
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.ultimas.set(await this.publicacionesService.listar(0, 3, 'fecha', miId));
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  empezarEdicion() {
    const usuario = this.auth.usuario();
    if (!usuario) {
      return;
    }
    this.formularioEdicion().reset({ correo: usuario.correo, nombreUsuario: usuario.nombreUsuario });
    this.imagenNueva.set(null);
    this.errorEdicion.set(null);
    this.exito.set(null);
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.imagenNueva.set(input.files?.[0] ?? null);
  }

  async guardarPerfil() {
    if (this.formularioEdicion().invalid()) {
      this.errorEdicion.set('Completá los campos correctamente');
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set(null);

    try {
      const datos = this.modeloEdicion();
      await this.auth.actualizarPerfil(datos.correo, datos.nombreUsuario, this.imagenNueva());
      this.editando.set(false);
      this.exito.set('Perfil actualizado.');
      await this.cargarUltimas();
    } catch (e) {
      this.errorEdicion.set(mensajeDeError(e));
    } finally {
      this.guardando.set(false);
    }
  }

  leDiMeGusta(publicacion: Publicacion) {
    const miId = this.auth.usuario()?._id;
    return !!miId && publicacion.meGusta.includes(miId);
  }

  async alternarMeGusta(publicacion: Publicacion) {
    this.error.set(null);
    try {
      const actualizada = this.leDiMeGusta(publicacion)
        ? await this.publicacionesService.quitarMeGusta(publicacion._id)
        : await this.publicacionesService.darMeGusta(publicacion._id);
      this.ultimas.update((lista) =>
        lista.map((p) => (p._id === actualizada._id ? actualizada : p)),
      );
    } catch (e) {
      this.error.set(mensajeDeError(e));
    }
  }
}
