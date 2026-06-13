import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MapaService } from './mapa.service';
import { MapaLocal, OcupacionPlanta } from './entities/mapa.entity';

@ApiTags('mapa')
@Controller('mapa')
export class MapaController {
  constructor(private readonly mapaService: MapaService) {}

  @Get('ocupacion-plantas')
  @ApiOperation({ summary: 'Ocupacion de locales agrupada por planta' })
  @ApiResponse({ status: 200, type: [OcupacionPlanta] })
  getOcupacionPlantas(): Promise<OcupacionPlanta[]> {
    return this.mapaService.getOcupacionPlantas();
  }

  @Get('locales')
  @ApiOperation({ summary: 'Mapa de locales con informacion de locatario y planta' })
  @ApiResponse({ status: 200, type: [MapaLocal] })
  getMapaLocales(): Promise<MapaLocal[]> {
    return this.mapaService.getMapaLocales();
  }
}
