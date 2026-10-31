import { Component, inject, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})

export class Registro {
  private auth = inject(Auth);
  private router = inject(Router);

  modelo = signal({
    nombre: '',
    apellido: '',
    correo: '',
    nombreUsuario: '',
    clave: '',
    repetirClave: '',
    fechaNacimiento: '',
    descripcion: '',
  });

  imagen = signal<File | null>(null);

  formulario = form(this.modelo, (campo) => {
    required(campo.nombre, { message: 'El nombre es obligatorio' });
    required(campo.apellido, { message: 'El apellido es obligatorio' });
    required(campo.correo, { message: 'El correo es obligatorio' });
    email(campo.correo, { message: 'Ingresá un correo válido' });
    required(campo.nombreUsuario, { message: 'El nombre de usuario es obligatorio' });
    required(campo.clave, { message: 'La contraseña es obligatoria' });
    minLength(campo.clave, 8, { message: 'La contraseña debe tener al menos 8 caracteres' });
    pattern(campo.clave, /[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula' });
    pattern(campo.clave, /\d/, { message: 'La contraseña debe tener al menos un número' });
    required(campo.repetirClave, { message: 'Repetí la contraseña' });
    required(campo.fechaNacimiento, { message: 'La fecha de nacimiento es obligatoria' });
    maxLength(campo.descripcion, 100, { message: 'La descripción no puede superar los 100 caracteres' });
  });

  error = signal<string | null>(null);
  cargando = signal(false);

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.imagen.set(input.files?.[0] ?? null);
  }

  async registrarse() {
    if (this.formulario().invalid()) {
      this.error.set('Completá los campos correctamente');
      return;
    }

    const datos = this.modelo();

    if (datos.clave !== datos.repetirClave) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      await this.auth.registrarse(datos, this.imagen());
      this.router.navigateByUrl('/publicaciones');
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
