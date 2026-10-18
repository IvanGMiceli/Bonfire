import { Component, inject, signal } from '@angular/core';
import { FormField, form, minLength, pattern, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})

export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  registrado = inject(ActivatedRoute).snapshot.queryParamMap.has('registrado');

  modelo = signal({ correoOUsuario: '', clave: '' });

  formulario = form(this.modelo, (campo) => {
    required(campo.correoOUsuario, { message: 'Ingresá tu correo o nombre de usuario' });
    required(campo.clave, { message: 'La contraseña es obligatoria' });
    minLength(campo.clave, 8, { message: 'La contraseña debe tener al menos 8 caracteres' });
    pattern(campo.clave, /[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula' });
    pattern(campo.clave, /\d/, { message: 'La contraseña debe tener al menos un número' });
  });

  error = signal<string | null>(null);
  cargando = signal(false);

  async ingresar() {
    if (this.formulario().invalid()) {
      this.error.set('Completá los campos correctamente');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const datos = this.modelo();
      await this.auth.iniciarSesion(datos.correoOUsuario, datos.clave);
      this.router.navigateByUrl('/publicaciones');
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
