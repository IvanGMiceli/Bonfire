import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../modelos/publicacion';
import { InicialPipe } from '../../pipes/inicial';
import { HacePipe } from '../../pipes/hace';
import { ResaltarAlPasarDirective } from '../../directivas/resaltar-al-pasar';
import { BrilloSegunMeGustaDirective } from '../../directivas/brillo-segun-me-gusta';

@Component({
  imports: [
    DatePipe,
    RouterLink,
    InicialPipe,
    HacePipe,
    ResaltarAlPasarDirective,
    BrilloSegunMeGustaDirective,
  ],
  selector: 'app-tarjeta-publicacion',
  styleUrl: './tarjeta-publicacion.css',
  templateUrl: './tarjeta-publicacion.html',
})
export class TarjetaPublicacion {
  @Input({ required: true }) publicacion!: Publicacion;
  @Input() puedeEliminar = false;
  @Input() leDiMeGusta = false;
  @Input() enDetalle = false;

  @Output() meGusta = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();
}
