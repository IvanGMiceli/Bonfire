import {  Body,  Controller,  HttpCode,  Post,  UploadedFile,  UseInterceptors,} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registro( @Body() datos: RegistroDto, @UploadedFile() imagen: Express.Multer.File  ) {
    return this.autenticacionService.registro(datos, imagen);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() datos: LoginDto) {
    return this.autenticacionService.login(datos);
  }
}
