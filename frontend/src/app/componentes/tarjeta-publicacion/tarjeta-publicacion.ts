import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../modelos/publicacion';

@Component({
  imports: [DatePipe],
  selector: 'app-tarjeta-publicacion',
  styleUrl: './tarjeta-publicacion.css',
  templateUrl: './tarjeta-publicacion.html',
})
export class TarjetaPublicacion {
  @Input({ required: true }) publicacion!: Publicacion;
  @Input() puedeEliminar = false;
  @Input() leDiMeGusta = false;

  @Output() meGusta = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();
}
