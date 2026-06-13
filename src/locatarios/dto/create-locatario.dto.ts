import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContratoLocatarioDto {
  @ApiProperty({ description: 'Fecha de inicio del contrato', example: '2025-01-01', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'fechaInicio debe ser una fecha valida (YYYY-MM-DD)' })
  fechaInicio?: string;

  @ApiProperty({ description: 'Fecha de fin del contrato', example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'fechaFin debe ser una fecha valida (YYYY-MM-DD)' })
  fechaFin?: string;

  @ApiProperty({ description: 'Renta base mensual', example: 5000.00, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'rentaBase debe ser un numero' })
  @IsPositive({ message: 'rentaBase debe ser un valor positivo' })
  rentaBase?: number;

  @ApiProperty({ description: 'Moneda de la renta (default L)', example: 'L', required: false })
  @IsOptional()
  @IsString({ message: 'moneda debe ser una cadena de texto' })
  @MaxLength(3, { message: 'moneda no puede exceder 3 caracteres' })
  moneda?: string;

  @ApiProperty({ description: 'ID del estado del contrato', example: '92e91fa5-b9fd-4690-ac93-9b3eb9ebdf3c', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'estadoContratoId debe ser un UUID valido' })
  estadoContratoId?: string;

  @ApiProperty({ description: 'ID del local asignado', example: 'c3d4e5f6-...', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'localId debe ser un UUID valido' })
  localId?: string;
}

export class CreateLocatarioDto {
  @ApiProperty({
    description: 'Nombre comercial del locatario',
    example: 'Cafe Central',
    maxLength: 120,
  })
  @IsString({ message: 'nombreComercial debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombreComercial es requerido' })
  @MaxLength(120, { message: 'nombreComercial no puede exceder 120 caracteres' })
  nombreComercial: string;

  @ApiProperty({
    description: 'Razon social',
    example: 'Cafe Central S.A.',
    maxLength: 180,
  })
  @IsNotEmpty({ message: 'razonSocial es requerido' })
  @IsString({ message: 'razonSocial debe ser una cadena de texto' })
  @MaxLength(180, { message: 'razonSocial no puede exceder 180 caracteres' })
  razonSocial: string;

  @ApiProperty({
    description: 'ID de la categoria asociada',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  @IsNotEmpty({ message: 'categoriaId es requerido' })
  @IsUUID('4', { message: 'categoriaId debe ser un UUID valido' })
  categoriaId: string;

  @ApiProperty({
    description: 'RTN unico',
    example: '08011999123960',
    maxLength: 20,
  })
  @IsString({ message: 'rtn debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'rtn es requerido' })
  @MaxLength(20, { message: 'rtn no puede exceder 20 caracteres' })
  rtn: string;

  @ApiProperty({
    description: 'Correo electronico',
    example: 'contacto@cafecentral.com',
    maxLength: 120,
  })
  @IsNotEmpty({ message: 'email es requerido' })
  @IsEmail({}, { message: 'email no tiene un formato valido' })
  @MaxLength(120, { message: 'email no puede exceder 120 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Telefono de contacto',
    example: '+504 2222-3333',
    maxLength: 30,
  })
  @IsString({ message: 'telefono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'telefono es requerido' })
  @MaxLength(30, { message: 'telefono no puede exceder 30 caracteres' })
  telefono: string;

  @ApiProperty({
    description: 'URL del logo principal',
    example: 'https://cdn.miapp.com/locatarios/logo-principal.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'logoUrl debe ser una cadena de texto' })
  logoUrl?: string;

  @ApiProperty({
    description: 'Contrato inicial del locatario (opcional)',
    type: () => CreateContratoLocatarioDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateContratoLocatarioDto)
  contrato?: CreateContratoLocatarioDto;
}
