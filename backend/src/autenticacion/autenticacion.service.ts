import { BadRequestException, Injectable } from '@nestjs/common';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AutenticacionService {

  registro(datos: RegistroDto, imagen?: Express.Multer.File) {
    if (datos.clave !== datos.repetirClave) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
  }
  
}
