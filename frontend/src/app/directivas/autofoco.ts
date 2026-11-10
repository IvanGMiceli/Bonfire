import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appAutofoco]' })
export class AutofocoDirective implements AfterViewInit {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit() {
    this.elemento.nativeElement.focus();
  }
}
