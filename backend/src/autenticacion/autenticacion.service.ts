import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RegistroDto } from './dto/registro.dto';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';

@Injectable()
export class AutenticacionService {
  constructor(private readonly almacenamientoService: AlmacenamientoService) {}

  async registro(datos: RegistroDto, imagen?: Express.Multer.File) {
    if (datos.clave !== datos.repetirClave) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const claveHasheada = await bcrypt.hash(datos.clave, 10);

    let imagenPerfil: string | undefined;
    if (imagen) {
      imagenPerfil = await this.almacenamientoService.subirImagen(imagen, 'perfiles');
    }
  }
}
