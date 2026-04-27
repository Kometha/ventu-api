import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
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
import { ImagenLocatarioDto } from './imagen-locatario.dto';

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
    description: 'RTN unico',
    example: '08011999123960',
    maxLength: 20,
  })
  @IsString({ message: 'rtn debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'rtn es requerido' })
  @MaxLength(20, { message: 'rtn no puede exceder 20 caracteres' })
  rtn: string;

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
    description: 'Correo electronico',
    example: 'contacto@cafecentral.com',
    maxLength: 120,
  })
  @IsNotEmpty({ message: 'email es requerido' })
  @IsEmail({}, { message: 'email no tiene un formato valido' })
  @MaxLength(120, { message: 'email no puede exceder 120 caracteres' })
  email: string;

  @ApiProperty({
    description: 'ID del local seleccionado (dropdown de locales)',
    example: 'f1494139-f5ff-4b69-a237-34a0be53af44',
  })
  @IsUUID('4', { message: 'localId debe ser un UUID valido' })
  localId: string;

  @ApiProperty({
    description: 'Categoria asociada al local (opcional, solo para validacion)',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'categoriaId debe ser un UUID valido' })
  categoriaId?: string;

  @ApiProperty({
    description: 'Estado del contrato',
    example: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
  })
  @IsUUID('4', { message: 'estadoContratoId debe ser un UUID valido' })
  estadoContratoId: string;

  @ApiProperty({
    description: 'Codigo de local (opcional, solo para validacion cruzada)',
    example: 'LOC-A12',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'codigoLocal debe ser una cadena de texto' })
  @MaxLength(20, { message: 'codigoLocal no puede exceder 20 caracteres' })
  codigoLocal?: string;

  @ApiProperty({
    description: 'Planta asociada al local (opcional, solo para validacion)',
    example: 'b98c4efd-df45-4b2f-a1d6-49a6ea0f8831',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'plantaId debe ser un UUID valido' })
  plantaId?: string;

  @ApiProperty({
    description: 'Area del local en metros cuadrados (opcional, solo para validacion)',
    example: 45.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'areaM2 debe ser numerico' })
  @IsPositive({ message: 'areaM2 debe ser mayor a 0' })
  areaM2?: number;

  @ApiProperty({
    description: 'Renta mensual base',
    example: 25000,
  })
  @IsNumber({}, { message: 'rentaMensual debe ser numerico' })
  @IsPositive({ message: 'rentaMensual debe ser mayor a 0' })
  rentaMensual: number;

  @ApiProperty({
    description: 'Fecha de inicio de contrato',
    example: '2026-05-01',
  })
  @IsDateString({}, { message: 'inicioContrato debe ser una fecha valida' })
  inicioContrato: string;

  @ApiProperty({
    description: 'Fecha de fin de contrato',
    example: '2027-04-30',
  })
  @IsDateString({}, { message: 'finContrato debe ser una fecha valida' })
  finContrato: string;

  @ApiProperty({
    description: 'Moneda del contrato (1 caracter)',
    example: 'L',
    required: false,
    maxLength: 1,
  })
  @IsOptional()
  @IsString({ message: 'moneda debe ser una cadena de texto' })
  @MaxLength(1, { message: 'moneda debe tener maximo 1 caracter' })
  moneda?: string;

  @ApiProperty({
    description: 'URL del logo principal',
    example: 'https://cdn.miapp.com/locatarios/logo-principal.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'logoUrl debe ser una cadena de texto' })
  logoUrl?: string;

  @ApiProperty({
    description: 'Imagenes asociadas al locatario',
    type: [ImagenLocatarioDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'imagenes debe ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => ImagenLocatarioDto)
  imagenes?: ImagenLocatarioDto[];
}
