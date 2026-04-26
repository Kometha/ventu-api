import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad Sample
 * Representa un elemento de ejemplo con propiedades básicas
 * Esta es una entidad simple para demostrar el CRUD
 */
export class Sample {
  /**
   * ID único del sample (UUID)
   */
  @ApiProperty({
    description: 'ID único del sample',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  /**
   * Nombre o título del sample
   */
  @ApiProperty({
    description: 'Nombre del sample',
    example: 'Mi primer sample',
  })
  name: string;

  /**
   * Descripción detallada del sample
   */
  @ApiProperty({
    description: 'Descripción del sample',
    example: 'Esta es una descripción de ejemplo',
  })
  description: string;

  /**
   * Indica si el sample está activo o no
   */
  @ApiProperty({
    description: 'Estado activo del sample',
    example: true,
  })
  isActive: boolean;

  /**
   * Fecha de creación del sample
   */
  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-10-28T19:00:00.000Z',
  })
  createdAt: Date;

  /**
   * Fecha de última actualización del sample
   */
  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-10-28T19:00:00.000Z',
  })
  updatedAt: Date;

  /**
   * Constructor de la entidad Sample
   * @param partial - Propiedades parciales para inicializar la entidad
   */
  constructor(partial: Partial<Sample>) {
    Object.assign(this, partial);
  }
}
