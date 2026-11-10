import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

const TOPE_ME_GUSTA = 10;

@Directive({ selector: '[appBrilloSegunMeGusta]' })
export class BrilloSegunMeGustaDirective implements OnChanges {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input('appBrilloSegunMeGusta') cantidad = 0;

  ngOnChanges() {
    const intensidad = Math.min(this.cantidad, TOPE_ME_GUSTA) / TOPE_ME_GUSTA;
    const estilo = this.elemento.nativeElement.style;

    if (intensidad === 0) {
      estilo.textShadow = '';
      estilo.boxShadow = '';
      return;
    }

    estilo.textShadow = `0 0 ${4 + intensidad * 10}px rgba(251, 191, 36, ${0.4 + intensidad * 0.6})`;
    estilo.boxShadow = `0 0 ${intensidad * 16}px rgba(234, 88, 12, ${intensidad * 0.5})`;
  }
}
