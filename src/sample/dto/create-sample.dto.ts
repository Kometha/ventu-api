import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO para crear un nuevo Sample
 * Incluye validaciones con class-validator y documentación con Swagger
 */
export class CreateSampleDto {
  /**
   * Nombre del sample (requerido)
   * Debe tener entre 3 y 100 caracteres
   */
  @ApiProperty({
    description: 'Nombre del sample',
    example: 'Mi primer sample',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  /**
   * Descripción del sample (opcional)
   * Máximo 500 caracteres
   */
  @ApiProperty({
    description: 'Descripción del sample',
    example: 'Esta es una descripción de ejemplo',
    required: false,
    maxLength: 500,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  /**
   * Estado activo del sample (opcional)
   * Por defecto es true
   */
  @ApiProperty({
    description: 'Indica si el sample está activo',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;
}

