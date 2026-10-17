import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { AlmacenamientoModule } from './almacenamiento/almacenamiento.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    UsuariosModule,
    AutenticacionModule,
    AlmacenamientoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}