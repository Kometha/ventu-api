import { PartialType } from '@nestjs/swagger';
import { CreateSampleDto } from './create-sample.dto';

/**
 * DTO para actualizar un Sample existente
 * Extiende de CreateSampleDto pero hace todas las propiedades opcionales
 * Esto permite actualizaciones parciales (PATCH)
 * 
 * PartialType de @nestjs/swagger mantiene las validaciones y la documentación
 * pero hace que todos los campos sean opcionales
 */
export class UpdateSampleDto extends PartialType(CreateSampleDto) {}

