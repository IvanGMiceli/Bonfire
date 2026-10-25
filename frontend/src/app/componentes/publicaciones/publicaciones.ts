import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TarjetaPublicacion } from '../tarjeta-publicacion/tarjeta-publicacion';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Auth } from '../../servicios/auth';
import { OrdenPublicaciones, Publicacion } from '../../modelos/publicacion';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';

const POR_PAGINA = 5;

@Component({
  imports: [TarjetaPublicacion],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})

export class Publicaciones implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  private auth = inject(Auth);

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  orden = signal<OrdenPublicaciones>('fecha');
  pagina = signal(0);
  haySiguiente = signal(false);
  
  aEliminar = signal<Publicacion | null>(null);
  eliminando = signal(false);

  esAdmin = computed(() => this.auth.usuario()?.perfil === 'administrador');

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const lista = await this.publicacionesService.listar(
        this.pagina() * POR_PAGINA,
        POR_PAGINA + 1,
        this.orden(),
      );
      this.haySiguiente.set(lista.length > POR_PAGINA);
      this.publicaciones.set(lista.slice(0, POR_PAGINA));
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarOrden(orden: OrdenPublicaciones) {
    if (orden === this.orden()) {
      return;
    }
    this.orden.set(orden);
    this.pagina.set(0);
    this.cargar();
  }

  anterior() {
    this.pagina.update((pagina) => pagina - 1);
    this.cargar();
  }

  siguiente() {
    this.pagina.update((pagina) => pagina + 1);
    this.cargar();
  }

  puedeEliminar(publicacion: Publicacion) {
    return publicacion.autor._id === this.auth.usuario()?._id || this.esAdmin();
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
      this.publicaciones.update((lista) =>
        lista.map((p) => (p._id === actualizada._id ? actualizada : p)),
      );
    } catch (e) {
      this.error.set(mensajeDeError(e));
    }
  }

  pedirConfirmacion(publicacion: Publicacion) {
    this.aEliminar.set(publicacion);
  }

  cancelarEliminacion() {
    this.aEliminar.set(null);
  }

  async confirmarEliminacion() {
    const publicacion = this.aEliminar();
    if (!publicacion) {
      return;
    }
    this.eliminando.set(true);
    try {
      await this.publicacionesService.eliminar(publicacion._id);
      if (this.publicaciones().length === 1 && this.pagina() > 0) {
        this.pagina.update((pagina) => pagina - 1);
      }
      await this.cargar();
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.eliminando.set(false);
      this.aEliminar.set(null);
    }
  }
}
