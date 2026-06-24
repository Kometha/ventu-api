import { ApiProperty } from '@nestjs/swagger';

export class Puesto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Gerente de RRHH' })
  nombre: string;

  @ApiProperty({
    example: 'Responsable del área de recursos humanos',
    nullable: true,
  })
  descripcion?: string | null;

  @ApiProperty({ example: 'd1d2d3d4-e5f6-7890-abcd-ef1234567890' })
  departamentoId: string;

  @ApiProperty({ example: 'Recursos Humanos', nullable: true })
  departamentoNombre?: string | null;

  @ApiProperty({ example: 25000.0, nullable: true })
  salarioMinimo?: number | null;

  @ApiProperty({ example: 40000.0, nullable: true })
  salarioMaximo?: number | null;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<Puesto>) {
    Object.assign(this, partial);
  }
}
