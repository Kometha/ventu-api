import { ApiProperty } from '@nestjs/swagger';

export class Departamento {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Recursos Humanos' })
  nombre: string;

  @ApiProperty({ example: 'Gestión del talento humano', nullable: true })
  descripcion?: string | null;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<Departamento>) {
    Object.assign(this, partial);
  }
}
