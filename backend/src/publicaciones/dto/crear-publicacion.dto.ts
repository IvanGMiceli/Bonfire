import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(50, { message: 'El título no puede ser mayor a 50 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(200, { message: 'El mensaje no puede ser mayor a 200 caracteres' })
  mensaje: string;
}
