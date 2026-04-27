import { ApiProperty } from '@nestjs/swagger';

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
    description: 'Imagenes del locatario',
    type: [ImagenLocatario],
  })
  imagenes: ImagenLocatario[];

  @ApiProperty({
    description: 'Informacion del contrato creado para el locatario',
    nullable: true,
    example: {
      id: '9c91ff21-c001-4e92-a073-bf2080142752',
      localId: 'f1494139-f5ff-4b69-a237-34a0be53af44',
      estadoContratoId: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
      fechaInicio: '2026-05-01',
      fechaFin: '2027-04-30',
      rentaBase: 25000,
      moneda: 'L',
    },
  })
  contratoActual?: {
    id: string;
    localId: string;
    estadoContratoId: string;
    fechaInicio: string;
    fechaFin: string;
    rentaBase: number;
    moneda: string;
  };

  constructor(partial: Partial<Locatario>) {
    Object.assign(this, partial);
  }
}
