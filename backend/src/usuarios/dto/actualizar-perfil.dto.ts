import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActualizarPerfilDto {
  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  correo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  nombreUsuario?: string;
}
