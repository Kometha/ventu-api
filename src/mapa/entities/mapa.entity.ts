import { ApiProperty } from '@nestjs/swagger';

export class OcupacionPlanta {
  @ApiProperty({ example: 1 })
  orden: number;

  @ApiProperty({ example: 'PB' })
  codigo: string;

  @ApiProperty({ example: 'Planta Baja' })
  nombre: string;

  @ApiProperty({ example: '905fe3e8-148e-4fe9-b60e-5edbc71496c4' })
  plantaId: string;

  @ApiProperty({ example: 2 })
  totalLocales: number;

  @ApiProperty({ example: 1 })
  localesOcupados: number;

  @ApiProperty({ example: 50 })
  porcentajeOcupacion: number;

  constructor(partial: Partial<OcupacionPlanta>) {
    Object.assign(this, partial);
  }
}

export class MapaLocal {
  @ApiProperty({ example: '5e121308-153a-48d7-ab8f-b95ec48a5219' })
  localId: string;

  @ApiProperty({ example: 'LOC-A12' })
  codigoLocal: string;

  @ApiProperty({ example: 'LOC-A12' })
  localNombre: string;

  @ApiProperty({ example: 45.5 })
  areaM2: number;

  @ApiProperty({ example: true, nullable: true })
  ocupado?: boolean | null;

  @ApiProperty({ example: '905fe3e8-148e-4fe9-b60e-5edbc71496c4' })
  plantaId: string;

  @ApiProperty({ example: 'PB' })
  plantaCodigo: string;

  @ApiProperty({ example: 'Planta Baja' })
  plantaNombre: string;

  @ApiProperty({ example: 1 })
  plantaOrden: number;

  @ApiProperty({ example: '106f78fe-b0d7-4f8d-98c7-9c7f079381fb', nullable: true })
  locatarioId?: string | null;

  @ApiProperty({ example: 'TAPACHULA', nullable: true })
  nombreComercial?: string | null;

  @ApiProperty({ example: 'TAPACHULA', nullable: true })
  razonSocial?: string | null;

  @ApiProperty({ example: 'orlando@email.com', nullable: true })
  email?: string | null;

  @ApiProperty({ example: '9561-9511', nullable: true })
  telefono?: string | null;

  @ApiProperty({ example: 'https://...logo.jpg', nullable: true })
  logoUrl?: string | null;

  @ApiProperty({ example: '66e038df-5bec-4fcb-b9ba-68d4035678d7', nullable: true })
  categoriaId?: string | null;

  @ApiProperty({ example: 'Oficinas', nullable: true })
  categoriaNombre?: string | null;

  @ApiProperty({ example: 'shopping-bag', nullable: true })
  categoriaIcono?: string | null;

  constructor(partial: Partial<MapaLocal>) {
    Object.assign(this, partial);
  }
}
