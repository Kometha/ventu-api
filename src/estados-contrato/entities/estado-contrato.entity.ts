import { ApiProperty } from '@nestjs/swagger';

export class EstadoContrato {
  @ApiProperty({
    description: 'ID unico del estado de contrato',
    example: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del estado de contrato',
    example: 'Activo',
  })
  nombre: string;

  @ApiProperty({
    description: 'Descripcion del estado',
    example: 'Contrato vigente y en cumplimiento',
    nullable: true,
  })
  descripcion?: string | null;

  constructor(partial: Partial<EstadoContrato>) {
    Object.assign(this, partial);
  }
}
