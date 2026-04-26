import { ApiProperty } from '@nestjs/swagger';

export class Planta {
  @ApiProperty({
    description: 'ID unico de la planta',
    example: 'b98c4efd-df45-4b2f-a1d6-49a6ea0f8831',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la planta',
    example: 'Planta Baja',
  })
  nombre: string;

  @ApiProperty({
    description: 'Codigo unico de la planta',
    example: 'PB',
  })
  codigo: string;

  @ApiProperty({
    description: 'Orden de la planta',
    example: 1,
  })
  orden: number;

  constructor(partial: Partial<Planta>) {
    Object.assign(this, partial);
  }
}
