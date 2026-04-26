/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BitacoraService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getBitacora() {
    const bitacora = await this.databaseService.executeFunction(
      'public.ft_obtener_bitacora',
      [],
    );
    return bitacora as any[];
  }
}
