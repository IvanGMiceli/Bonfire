import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { TokenGuard } from '../autenticacion/token.guard';
import { AdministradorGuard } from '../autenticacion/administrador.guard';

@Controller('estadisticas')
@UseGuards(TokenGuard, AdministradorGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.comentariosPorDia(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}
