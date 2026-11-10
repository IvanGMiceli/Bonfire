import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';

@Module({
  imports: [
    UsuariosModule,
    AlmacenamientoModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRETO,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AutenticacionService],
  controllers: [AutenticacionController],
})
export class AutenticacionModule {}
