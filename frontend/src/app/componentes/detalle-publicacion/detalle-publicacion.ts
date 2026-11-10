import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { PublicacionesService } from '../../servicios/publicaciones';
import { ComentariosService } from '../../servicios/comentarios';
import { Auth } from '../../servicios/auth';
import { Publicacion } from '../../modelos/publicacion';
import { Comentario } from '../../modelos/comentario';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';
import { InicialPipe } from '../../pipes/inicial';
import { HacePipe } from '../../pipes/hace';
import { AutofocoDirective } from '../../directivas/autofoco';
import { ResaltarAlPasarDirective } from '../../directivas/resaltar-al-pasar';

const POR_TANDA = 5;

@Component({
  imports: [
    DatePipe,
    RouterLink,
    FormField,
    TarjetaPublicacion,
    InicialPipe,
    HacePipe,
    AutofocoDirective,
    ResaltarAlPasarDirective,
  ],
  selector: 'app-detalle-publicacion',
  styleUrl: './detalle-publicacion.css',
  templateUrl: './detalle-publicacion.html',
})

export class DetallePublicacion implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  private auth = inject(Auth);

  private id = '';

  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  comentarios = signal<Comentario[]>([]);
  hayMas = signal(false);
  cargandoComentarios = signal(false);
  errorComentarios = signal<string | null>(null);

  modeloNuevo = signal({ mensaje: '' });

  formularioNuevo = form(this.modeloNuevo, (campo) => {
    required(campo.mensaje, { message: 'El comentario no puede estar vacío' });
    maxLength(campo.mensaje, 200, { message: 'El comentario no puede superar los 200 caracteres' });
  });

  enviando = signal(false);
  errorNuevo = signal<string | null>(null);

  editandoId = signal<string | null>(null);
  modeloEdicion = signal({ mensaje: '' });

  formularioEdicion = form(this.modeloEdicion, (campo) => {
    required(campo.mensaje, { message: 'El comentario no puede estar vacío' });
    maxLength(campo.mensaje, 200, { message: 'El comentario no puede superar los 200 caracteres' });
  });

  guardando = signal(false);
  errorEdicion = signal<string | null>(null);

  esAdmin = computed(() => this.auth.usuario()?.perfil === 'administrador');
  confirmandoEliminacion = signal(false);
  eliminando = signal(false);

  async ngOnInit() {
    this.id = this.ruta.snapshot.paramMap.get('id') ?? '';
    await this.cargarPublicacion();
    if (this.publicacion()) {
      await this.cargarComentarios();
    }
  }

  async cargarPublicacion() {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.publicacion.set(await this.publicacionesService.obtener(this.id));
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarComentarios() {
    this.cargandoComentarios.set(true);
    this.errorComentarios.set(null);
    try {
      const tanda = await this.comentariosService.listar(
        this.id,
        this.comentarios().length,
        POR_TANDA + 1,
      );
      this.hayMas.set(tanda.length > POR_TANDA);
      this.comentarios.update((lista) => [...lista, ...tanda.slice(0, POR_TANDA)]);
    } catch (e) {
      this.errorComentarios.set(mensajeDeError(e));
    } finally {
      this.cargandoComentarios.set(false);
    }
  }

  async comentar() {
    const mensaje = this.modeloNuevo().mensaje.trim();
    if (this.formularioNuevo().invalid() || !mensaje) {
      this.errorNuevo.set('Escribí un comentario de hasta 200 caracteres');
      return;
    }

    this.enviando.set(true);
    this.errorNuevo.set(null);

    try {
      const nuevo = await this.comentariosService.crear(this.id, mensaje);
      this.comentarios.update((lista) => [nuevo, ...lista]);
      this.formularioNuevo().reset({ mensaje: '' });
    } catch (e) {
      this.errorNuevo.set(mensajeDeError(e));
    } finally {
      this.enviando.set(false);
    }
  }

  esMio(comentario: Comentario) {
    return comentario.autor._id === this.auth.usuario()?._id;
  }

  empezarEdicion(comentario: Comentario) {
    this.formularioEdicion().reset({ mensaje: comentario.mensaje });
    this.errorEdicion.set(null);
    this.editandoId.set(comentario._id);
  }

  cancelarEdicion() {
    this.editandoId.set(null);
  }

  async guardarEdicion(comentario: Comentario) {
    const mensaje = this.modeloEdicion().mensaje.trim();
    if (this.formularioEdicion().invalid() || !mensaje) {
      this.errorEdicion.set('Escribí un comentario de hasta 200 caracteres');
      return;
    }

    if (mensaje === comentario.mensaje) {
      this.editandoId.set(null);
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set(null);

    try {
      const actualizado = await this.comentariosService.modificar(comentario._id, mensaje);
      this.comentarios.update((lista) =>
        lista.map((c) => (c._id === actualizado._id ? actualizado : c)),
      );
      this.editandoId.set(null);
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
      this.publicacion.set(actualizada);
    } catch (e) {
      this.error.set(mensajeDeError(e));
    }
  }

  puedeEliminar(publicacion: Publicacion) {
    return publicacion.autor._id === this.auth.usuario()?._id || this.esAdmin();
  }

  pedirConfirmacion() {
    this.confirmandoEliminacion.set(true);
  }

  cancelarEliminacion() {
    this.confirmandoEliminacion.set(false);
  }

  async confirmarEliminacion() {
    this.eliminando.set(true);
    this.error.set(null);
    try {
      await this.publicacionesService.eliminar(this.id);
      this.router.navigateByUrl('/publicaciones');
    } catch (e) {
      this.error.set(mensajeDeError(e));
      this.confirmandoEliminacion.set(false);
    } finally {
      this.eliminando.set(false);
    }
  }
}
