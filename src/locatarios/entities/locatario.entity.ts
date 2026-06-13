import { ApiProperty } from '@nestjs/swagger';

export class LocatarioAuditoria {
  @ApiProperty({ description: 'ID del registro de auditoria', example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ description: 'ID del locatario auditado', example: 'ff8482e8-...', nullable: true })
  locatarioId?: string | null;

  @ApiProperty({ description: 'Operacion realizada', example: 'UPDATE' })
  operacion: string;

  @ApiProperty({ description: 'Datos antes de la operacion', nullable: true })
  datosAnteriores?: Record<string, any> | null;

  @ApiProperty({ description: 'Datos despues de la operacion', nullable: true })
  datosNuevos?: Record<string, any> | null;

  @ApiProperty({ description: 'Usuario de base de datos que ejecuto la operacion', nullable: true })
  usuarioDb?: string | null;

  @ApiProperty({ description: 'Fecha y hora de la operacion', example: '2026-06-11T18:00:00.000Z' })
  fecha: Date;

  constructor(partial: Partial<LocatarioAuditoria>) {
    Object.assign(this, partial);
  }
}

export class LocalResumen {
  @ApiProperty({ description: 'ID del local', example: 'c3d4e5f6-...' })
  id: string;

  @ApiProperty({ description: 'Nombre del local', example: 'Local 101' })
  nombre: string;

  @ApiProperty({ description: 'Codigo del local', example: 'L-101' })
  codigoLocal: string;

  @ApiProperty({ description: 'Area en metros cuadrados', example: 45.5 })
  areaM2: number;

  @ApiProperty({ description: 'Descripcion del local', example: 'Local esquinero planta baja', nullable: true })
  descripcion?: string | null;

  constructor(partial: Partial<LocalResumen>) {
    Object.assign(this, partial);
  }
}

export class EstadoContrato {
  @ApiProperty({ description: 'ID del estado', example: 'b2c3d4e5-...' })
  id: string;

  @ApiProperty({ description: 'Nombre del estado', example: 'Vigente' })
  nombre: string;

  @ApiProperty({ description: 'Descripcion del estado', example: 'Contrato activo y en vigor', nullable: true })
  descripcion?: string | null;

  constructor(partial: Partial<EstadoContrato>) {
    Object.assign(this, partial);
  }
}

export class ContratoResumen {
  @ApiProperty({ description: 'ID del contrato', example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ description: 'Renta base del contrato', example: 5000.0 })
  rentaBase: number;

  @ApiProperty({ description: 'Moneda de la renta', example: 'L' })
  moneda: string;

  @ApiProperty({ description: 'Fecha de inicio del contrato', example: '2025-01-01' })
  fechaInicio: string;

  @ApiProperty({ description: 'Fecha de fin del contrato', example: '2026-01-01' })
  fechaFin: string;

  @ApiProperty({ description: 'Estado del contrato', type: EstadoContrato, nullable: true })
  estadoContrato?: EstadoContrato | null;

  constructor(partial: Partial<ContratoResumen>) {
    Object.assign(this, partial);
  }
}

export class ImagenLocatario {
  @ApiProperty({
    description: 'ID de la imagen',
    example: '4ba3d6ad-d669-46f9-b66e-93d7d9f339d0',
  })
  id: string;

  @ApiProperty({
    description: 'ID del locatario asociado',
    example: 'ff8482e8-1cc7-4e92-a073-bf2080142752',
  })
  locatarioId: string;

  @ApiProperty({
    description: 'URL de la imagen',
    example: 'https://cdn.miapp.com/locatarios/foto-1.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Orden de la imagen',
    example: 0,
  })
  orden: number;

  @ApiProperty({
    description: 'Marca si la imagen es portada',
    example: false,
  })
  esPortada: boolean;

  @ApiProperty({
    description: 'Fecha de creacion',
    example: '2026-04-26T16:00:00.000Z',
  })
  createdAt: Date;

  constructor(partial: Partial<ImagenLocatario>) {
    Object.assign(this, partial);
  }
}

export class Locatario {
  @ApiProperty({
    description: 'ID del locatario',
    example: 'ff8482e8-1cc7-4e92-a073-bf2080142752',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre comercial',
    example: 'Cafe Central',
  })
  nombreComercial: string;

  @ApiProperty({
    description: 'Razon social',
    example: 'Cafe Central S.A.',
    nullable: true,
  })
  razonSocial?: string | null;

  @ApiProperty({
    description: 'ID de la categoria asociada',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  categoriaId: string;

  @ApiProperty({
    description: 'RTN',
    example: '08011999123960',
    nullable: true,
  })
  rtn?: string | null;

  @ApiProperty({
    description: 'Telefono',
    example: '+504 2222-3333',
    nullable: true,
  })
  telefono?: string | null;

  @ApiProperty({
    description: 'Email',
    example: 'contacto@cafecentral.com',
    nullable: true,
  })
  email?: string | null;

  @ApiProperty({
    description: 'URL del logo',
    example: 'https://cdn.miapp.com/locatarios/logo-principal.png',
    nullable: true,
  })
  logoUrl?: string | null;

  @ApiProperty({
    description: 'Fecha de creacion',
    example: '2026-04-26T16:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Local asignado al locatario segun su contrato',
    type: LocalResumen,
    nullable: true,
  })
  local?: LocalResumen | null;

  @ApiProperty({
    description: 'Contrato vigente o mas reciente del locatario',
    type: ContratoResumen,
    nullable: true,
  })
  contrato?: ContratoResumen | null;

  @ApiProperty({
    description: 'Imagenes del locatario',
    type: [ImagenLocatario],
  })
  imagenes: ImagenLocatario[];

  constructor(partial: Partial<Locatario>) {
    Object.assign(this, partial);
  }
}
