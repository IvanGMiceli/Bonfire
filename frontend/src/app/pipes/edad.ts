import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'edad' })
export class EdadPipe implements PipeTransform {
  transform(fechaNacimiento: string | Date | null | undefined): string {
    if (!fechaNacimiento) {
      return '';
    }

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getUTCFullYear();

    const todaviaNoCumplio =
      hoy.getMonth() < nacimiento.getUTCMonth() ||
      (hoy.getMonth() === nacimiento.getUTCMonth() && hoy.getDate() < nacimiento.getUTCDate());

    if (todaviaNoCumplio) {
      edad--;
    }

    return `${edad} años`;
  }
}
