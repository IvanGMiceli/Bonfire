import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';

@Module({
  imports: [UsuariosModule, AlmacenamientoModule],
  providers: [AutenticacionService],
  controllers: [AutenticacionController],
})
export class AutenticacionModule {}
