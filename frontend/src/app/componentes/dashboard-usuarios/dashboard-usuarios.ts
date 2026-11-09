import { Component, OnInit, inject, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { UsuariosService } from '../../servicios/usuarios';
import { Auth } from '../../servicios/auth';
import { Usuario } from '../../modelos/usuario';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';
import { InicialPipe } from '../../pipes/inicial';

const FORMULARIO_VACIO = {
  nombre: '',
  apellido: '',
  correo: '',
  nombreUsuario: '',
  clave: '',
  repetirClave: '',
  fechaNacimiento: '',
  descripcion: '',
};

@Component({
  imports: [FormField, InicialPipe],
  selector: 'app-dashboard-usuarios',
  styleUrl: './dashboard-usuarios.css',
  templateUrl: './dashboard-usuarios.html',
})

export class DashboardUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private auth = inject(Auth);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  procesandoId = signal<string | null>(null);

  mostrarFormulario = signal(false);
  modelo = signal({ ...FORMULARIO_VACIO });

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

  perfil = signal<Usuario['perfil']>('usuario');
  imagen = signal<File | null>(null);
  creando = signal(false);
  errorAlta = signal<string | null>(null);
  exitoAlta = signal<string | null>(null);

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.usuarios.set(await this.usuariosService.listar());
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  esYo(usuario: Usuario) {
    return usuario._id === this.auth.usuario()?._id;
  }

  alternarFormulario() {
    this.mostrarFormulario.update((valor) => !valor);
    this.errorAlta.set(null);
    this.exitoAlta.set(null);
  }

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.imagen.set(input.files?.[0] ?? null);
  }

  async crear(selectorImagen: HTMLInputElement) {
    if (this.formulario().invalid()) {
      this.errorAlta.set('Completá los campos correctamente');
      return;
    }

    const datos = this.modelo();

    if (datos.clave !== datos.repetirClave) {
      this.errorAlta.set('Las contraseñas no coinciden');
      return;
    }

    this.creando.set(true);
    this.errorAlta.set(null);
    this.exitoAlta.set(null);

    try {
      const nuevo = await this.usuariosService.crear(datos, this.perfil(), this.imagen());
      this.usuarios.update((lista) => [...lista, nuevo]);
      this.formulario().reset({ ...FORMULARIO_VACIO });
      this.perfil.set('usuario');
      this.imagen.set(null);
      selectorImagen.value = '';
      this.exitoAlta.set(`Se creó la cuenta de ${nuevo.nombreUsuario}.`);
    } catch (e) {
      this.errorAlta.set(mensajeDeError(e));
    } finally {
      this.creando.set(false);
    }
  }

  async cambiarEstado(usuario: Usuario) {
    this.procesandoId.set(usuario._id);
    this.error.set(null);
    try {
      const actualizado = usuario.activo
        ? await this.usuariosService.deshabilitar(usuario._id)
        : await this.usuariosService.habilitar(usuario._id);
      this.usuarios.update((lista) =>
        lista.map((u) => (u._id === actualizado._id ? actualizado : u)),
      );
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.procesandoId.set(null);
    }
  }
}
