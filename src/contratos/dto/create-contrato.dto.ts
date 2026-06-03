import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateContratoDto {
  @ApiProperty({
    description: 'ID del local arrendado',
    example: 'f1494139-f5ff-4b69-a237-34a0be53af44',
  })
  @IsUUID('4', { message: 'localId debe ser un UUID valido' })
  localId: string;

  @ApiProperty({
    description: 'ID del locatario',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4', { message: 'locatarioId debe ser un UUID valido' })
  locatarioId: string;

  @ApiProperty({
    description: 'ID del estado del contrato',
    example: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
  })
  @IsUUID('4', { message: 'estadoContratoId debe ser un UUID valido' })
  estadoContratoId: string;

  @ApiProperty({
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsDateString({}, { message: 'fechaInicio debe tener formato YYYY-MM-DD' })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2027-12-31',
  })
  @IsDateString({}, { message: 'fechaFin debe tener formato YYYY-MM-DD' })
  fechaFin: string;

  @ApiProperty({
    description: 'Renta base mensual',
    example: 15000,
  })
  @IsNumber({}, { message: 'rentaBase debe ser numerico' })
  @IsPositive({ message: 'rentaBase debe ser mayor a 0' })
  rentaBase: number;

  @ApiProperty({
    description: 'Moneda del contrato',
    example: 'HNL',
    required: false,
    default: 'HNL',
  })
  @IsOptional()
  @IsString({ message: 'moneda debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'moneda no puede estar vacia' })
  @MaxLength(3, { message: 'moneda no puede exceder 3 caracteres' })
  moneda?: string;
}
