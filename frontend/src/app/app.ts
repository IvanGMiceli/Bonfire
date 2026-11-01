import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './servicios/auth';
import { mensajeDeError } from './utilidades/mensaje-de-error';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App implements OnInit {
  protected auth = inject(Auth);
  private router = inject(Router);

  cargando = signal(true);
  extendiendo = signal(false);
  errorAviso = signal<string | null>(null);

  async ngOnInit() {
    await this.auth.restaurarSesion();

    const rutaPublica = ['/login', '/registro'].includes(window.location.pathname);
    if (!this.auth.usuario() && !rutaPublica) {
      await this.router.navigateByUrl('/login');
    }

    this.cargando.set(false);
  }

  async extenderSesion() {
    this.extendiendo.set(true);
    this.errorAviso.set(null);
    try {
      await this.auth.extenderSesion();
    } catch (e) {
      if (this.auth.avisoSesion()) {
        this.errorAviso.set(mensajeDeError(e));
      }
    } finally {
      this.extendiendo.set(false);
    }
  }

  ahoraNo() {
    this.errorAviso.set(null);
    this.auth.cerrarAviso();
  }

  salir() {
    this.auth.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}
