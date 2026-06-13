import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MapaLocal, OcupacionPlanta } from './entities/mapa.entity';

@Injectable()
export class MapaService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getOcupacionPlantas(): Promise<OcupacionPlanta[]> {
    try {
      const result = await this.databaseService.query<OcupacionPlanta>(
        `SELECT * FROM vw_ocupacion_plantas`,
      );
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener ocupacion de plantas: ${error?.message ?? ''}`.trim(),
      );
    }
  }

  async getMapaLocales(): Promise<MapaLocal[]> {
    try {
      const result = await this.databaseService.query<MapaLocal>(
        `SELECT * FROM vw_mapa_locales`,
      );
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener mapa de locales: ${error?.message ?? ''}`.trim(),
      );
    }
  }
}
