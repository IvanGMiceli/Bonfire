import { Pipe, PipeTransform } from '@angular/core';

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
const MES = 30 * DIA;
const ANIO = 365 * DIA;

@Pipe({ name: 'hace' })
export class HacePipe implements PipeTransform {
  transform(fecha: string | Date | null | undefined): string {
    if (!fecha) {
      return '';
    }

    const transcurrido = Date.now() - new Date(fecha).getTime();

    if (transcurrido < MINUTO) {
      return 'hace un momento';
    }
    if (transcurrido < HORA) {
      return this.armar(Math.floor(transcurrido / MINUTO), 'minuto', 'minutos');
    }
    if (transcurrido < DIA) {
      return this.armar(Math.floor(transcurrido / HORA), 'hora', 'horas');
    }
    if (transcurrido < MES) {
      return this.armar(Math.floor(transcurrido / DIA), 'día', 'días');
    }
    if (transcurrido < ANIO) {
      return this.armar(Math.floor(transcurrido / MES), 'mes', 'meses');
    }
    return this.armar(Math.floor(transcurrido / ANIO), 'año', 'años');
  }

  private armar(cantidad: number, singular: string, plural: string) {
    return `hace ${cantidad} ${cantidad === 1 ? singular : plural}`;
  }
}
