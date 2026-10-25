import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { PublicacionesService } from '../../servicios/publicaciones';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';

@Component({
  imports: [FormField],
  selector: 'app-nueva-publicacion',
  styleUrl: './nueva-publicacion.css',
  templateUrl: './nueva-publicacion.html',
})
export class NuevaPublicacion {
  private publicacionesService = inject(PublicacionesService);

  @Output() publicada = new EventEmitter<void>();

  modelo = signal({ titulo: '', mensaje: '' });

  formulario = form(this.modelo, (campo) => {
    required(campo.titulo, { message: 'El título es obligatorio' });
    maxLength(campo.titulo, 50, { message: 'El título no puede superar los 50 caracteres' });
    required(campo.mensaje, { message: 'El mensaje es obligatorio' });
    maxLength(campo.mensaje, 200, { message: 'El mensaje no puede superar los 200 caracteres' });
  });

  imagen = signal<File | null>(null);
  error = signal<string | null>(null);
  publicando = signal(false);

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.imagen.set(input.files?.[0] ?? null);
  }

  async publicar(selectorImagen: HTMLInputElement) {
    if (this.formulario().invalid()) {
      this.error.set('Completá los campos correctamente');
      return;
    }

    this.publicando.set(true);
    this.error.set(null);

    try {
      const datos = this.modelo();
      await this.publicacionesService.crear(datos.titulo, datos.mensaje, this.imagen());
      this.formulario().reset({ titulo: '', mensaje: '' });
      this.imagen.set(null);
      selectorImagen.value = '';
      this.publicada.emit();
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.publicando.set(false);
    }
  }
}
