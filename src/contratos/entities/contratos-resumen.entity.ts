import { ApiProperty } from '@nestjs/swagger';
import { ContratoEstadoResumen } from './contrato.entity';

export class ContratoResumenPorEstado {
  @ApiProperty({
    description: 'Estado del contrato',
    type: ContratoEstadoResumen,
  })
  estado: ContratoEstadoResumen;

  @ApiProperty({
    description: 'Cantidad de contratos en este estado',
    example: 12,
  })
  cantidad: number;

  constructor(partial: Partial<ContratoResumenPorEstado>) {
    Object.assign(this, partial);
  }
}

export class ContratosResumen {
  @ApiProperty({
    description: 'Total de contratos en la base de datos',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Conteo de contratos agrupado por cada estado definido en el catalogo',
    type: [ContratoResumenPorEstado],
  })
  porEstado: ContratoResumenPorEstado[];

  constructor(partial: Partial<ContratosResumen>) {
    Object.assign(this, partial);
  }
}
