import { ApiProperty } from '@nestjs/swagger';

export class ArchivoContrato {
  @ApiProperty({ description: 'ID del archivo', example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ description: 'Nombre del archivo', example: 'contrato-001.pdf' })
  filename: string;

  @ApiProperty({ description: 'URL publica del archivo en Supabase', example: 'https://xxxx.supabase.co/storage/v1/object/public/public/contratos/archivos/2026/uuid.pdf' })
  url: string;

  @ApiProperty({ description: 'Fecha de creacion', example: '2026-06-12T10:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<ArchivoContrato>) {
    Object.assign(this, partial);
  }
}
