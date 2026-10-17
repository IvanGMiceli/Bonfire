import {  IsDateString, IsEmail,  IsNotEmpty,  IsOptional,  IsString,  Matches,  MaxLength,  MinLength } from 'class-validator';

export class RegistroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  nombreUsuario: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula' })
  @Matches(/\d/, { message: 'La contraseña debe tener al menos un número' })
  clave: string;

  @IsString()
  @IsNotEmpty({ message: 'Repetir la contraseña es obligatorio' })
  repetirClave: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La descripción no puede ser mayor a 100 caracteres' })
  descripcion?: string;
}
