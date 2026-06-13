import { ApiProperty } from '@nestjs/swagger';

export class ContratoLocalResumen {
  @ApiProperty({ example: 'f1494139-f5ff-4b69-a237-34a0be53af44' })
  id: string;

  @ApiProperty({ example: 'Local A-12' })
  nombre: string;

  @ApiProperty({ example: 'LOC-A12' })
  codigoLocal: string;

  constructor(partial: Partial<ContratoLocalResumen>) {
    Object.assign(this, partial);
  }
}

export class ContratoLocatarioResumen {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Tienda La Esquina' })
  nombreComercial: string;

  @ApiProperty({ example: 'La Esquina S.A.', nullable: true })
  razonSocial: string | null;

  constructor(partial: Partial<ContratoLocatarioResumen>) {
    Object.assign(this, partial);
  }
}

export class ContratoEstadoResumen {
  @ApiProperty({ example: '0f05954b-cd42-48b5-af62-5bcc7d359d29' })
  id: string;

  @ApiProperty({ example: 'Activo' })
  nombre: string;

  @ApiProperty({ example: 'Contrato vigente', nullable: true })
  descripcion: string | null;

  constructor(partial: Partial<ContratoEstadoResumen>) {
    Object.assign(this, partial);
  }
}

export class Contrato {
  @ApiProperty({
    description: 'ID unico del contrato',
    example: 'c8f3a2b1-4d5e-6f70-8192-a3b4c5d6e7f8',
  })
  id: string;

  @ApiProperty({
    description: 'ID del local asociado',
    example: 'f1494139-f5ff-4b69-a237-34a0be53af44',
  })
  localId: string;

  @ApiProperty({
    description: 'ID del locatario asociado',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  locatarioId: string;

  @ApiProperty({
    description: 'ID del estado del contrato',
    example: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
  })
  estadoContratoId: string;

  @ApiProperty({
    description: 'Fecha de inicio del contrato (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin del contrato (YYYY-MM-DD)',
    example: '2027-12-31',
  })
  fechaFin: string;

  @ApiProperty({
    description: 'Renta base mensual',
    example: 15000,
  })
  rentaBase: number;

  @ApiProperty({
    description: 'Moneda del contrato',
    example: 'L',
  })
  moneda: string;

  @ApiProperty({
    description: 'Datos resumidos del local',
    type: ContratoLocalResumen,
  })
  local: ContratoLocalResumen;

  @ApiProperty({
    description: 'Datos resumidos del locatario',
    type: ContratoLocatarioResumen,
  })
  locatario: ContratoLocatarioResumen;

  @ApiProperty({
    description: 'Datos resumidos del estado del contrato',
    type: ContratoEstadoResumen,
  })
  estadoContrato: ContratoEstadoResumen;

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

  constructor(partial: Partial<Contrato>) {
    Object.assign(this, partial);
  }
}
