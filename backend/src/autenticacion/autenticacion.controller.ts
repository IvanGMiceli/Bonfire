import {  Body,  Controller,  Post,  UploadedFile,  UseInterceptors,} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registro( @Body() datos: RegistroDto, @UploadedFile() imagen: Express.Multer.File  ) {
    return this.autenticacionService.registro(datos, imagen);
  }
}
