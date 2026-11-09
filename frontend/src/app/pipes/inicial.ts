import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inicial' })
export class InicialPipe implements PipeTransform {
  transform(texto: string | null | undefined): string {
    return (texto ?? '').trim().charAt(0).toUpperCase();
  }
}
