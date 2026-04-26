/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener bitácora' })
  @ApiResponse({ status: 200, description: 'Bitácora obtenida correctamente' })
  getBitacora() {
    return this.bitacoraService.getBitacora();
  }
}
