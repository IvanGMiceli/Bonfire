import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

const COLOR_POR_DEFECTO = '#ea580c';

@Directive({ selector: '[appResaltarAlPasar]' })
export class ResaltarAlPasarDirective {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input('appResaltarAlPasar') color = '';

  @HostListener('mouseenter')
  alEntrar() {
    const color = this.color || COLOR_POR_DEFECTO;
    const estilo = this.elemento.nativeElement.style;
    estilo.transition = 'border-color 0.2s, box-shadow 0.2s';
    estilo.borderColor = color;
    estilo.boxShadow = `0 0 18px ${color}55`;
  }

  @HostListener('mouseleave')
  alSalir() {
    const estilo = this.elemento.nativeElement.style;
    estilo.borderColor = '';
    estilo.boxShadow = '';
  }
}
