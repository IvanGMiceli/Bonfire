import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './servicios/auth';

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

  async ngOnInit() {
    await this.auth.restaurarSesion();

    const rutaPublica = ['/login', '/registro'].includes(window.location.pathname);
    if (!this.auth.usuario() && !rutaPublica) {
      await this.router.navigateByUrl('/login');
    }

    this.cargando.set(false);
  }

  salir() {
    this.auth.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}
