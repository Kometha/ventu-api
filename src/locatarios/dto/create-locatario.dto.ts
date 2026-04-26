import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
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
  @MaxLength(120, { message: 'nombreComercial no puede exceder 120 caracteres' })
  nombreComercial: string;

  @ApiProperty({
    description: 'Razon social',
    example: 'Cafe Central S.A.',
    maxLength: 180,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'razonSocial debe ser una cadena de texto' })
  @MaxLength(180, { message: 'razonSocial no puede exceder 180 caracteres' })
  razonSocial?: string;

  @ApiProperty({
    description: 'RTN unico',
    example: '08011999123960',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'rtn debe ser una cadena de texto' })
  @MaxLength(20, { message: 'rtn no puede exceder 20 caracteres' })
  rtn?: string;

  @ApiProperty({
    description: 'Telefono de contacto',
    example: '+504 2222-3333',
    maxLength: 30,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'telefono debe ser una cadena de texto' })
  @MaxLength(30, { message: 'telefono no puede exceder 30 caracteres' })
  telefono?: string;

  @ApiProperty({
    description: 'Correo electronico',
    example: 'contacto@cafecentral.com',
    maxLength: 120,
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'email no tiene un formato valido' })
  @MaxLength(120, { message: 'email no puede exceder 120 caracteres' })
  email?: string;

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
