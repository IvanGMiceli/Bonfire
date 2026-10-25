import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { Auth } from '../../servicios/auth';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Publicacion } from '../../modelos/publicacion';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';

@Component({
  imports: [DatePipe, TarjetaPublicacion],
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
