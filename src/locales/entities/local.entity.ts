import { ApiProperty } from '@nestjs/swagger';

export class Local {
  @ApiProperty({
    description: 'ID unico del local',
    example: 'f1494139-f5ff-4b69-a237-34a0be53af44',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del local',
    example: 'Local A-12',
  })
  nombre: string;

  @ApiProperty({
    description: 'Codigo unico del local',
    example: 'LOC-A12',
  })
  codigoLocal: string;

  @ApiProperty({
    description: 'ID de la categoria asociada',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  categoriaId: string;

  @ApiProperty({
    description: 'ID de la planta asociada',
    example: '42f8bd8c-aa31-4cfd-8f97-e17a3ec85f63',
  })
  plantaId: string;

  @ApiProperty({
    description: 'Area en metros cuadrados',
    example: 45.5,
  })
  areaM2: number;

  @ApiProperty({
    description: 'Descripcion del local',
    example: 'Local comercial en planta baja',
    nullable: true,
  })
  descripcion?: string | null;

  @ApiProperty({
    description: 'Fecha de creacion',
    example: '2026-04-26T15:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualizacion',
    example: '2026-04-26T15:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<Local>) {
    Object.assign(this, partial);
  }
}
