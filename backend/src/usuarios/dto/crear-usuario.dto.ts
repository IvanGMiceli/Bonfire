import { IsIn } from 'class-validator';
import { RegistroDto } from '../../autenticacion/dto/registro.dto';

export class CrearUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser usuario o administrador' })
  perfil: string;
}
