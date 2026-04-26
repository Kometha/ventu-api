import { ApiProperty } from '@nestjs/swagger';

export class Categoria {
  @ApiProperty({
    description: 'ID unico de la categoria',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la categoria',
    example: 'Restaurantes',
  })
  nombre: string;

  @ApiProperty({
    description: 'Icono representativo de la categoria',
    example: 'storefront',
    nullable: true,
  })
  icono?: string | null;

  @ApiProperty({
    description: 'Fecha de creacion',
    example: '2026-04-26T16:00:00.000Z',
  })
  createdAt: Date;

  constructor(partial: Partial<Categoria>) {
    Object.assign(this, partial);
  }
}
