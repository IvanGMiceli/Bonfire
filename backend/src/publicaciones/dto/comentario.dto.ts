import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(200, { message: 'El comentario no puede ser mayor a 200 caracteres' })
  mensaje: string;
}
