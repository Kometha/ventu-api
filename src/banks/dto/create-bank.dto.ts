import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateBankDto {
  @ApiProperty({
    description: 'Código único del banco',
    example: 'BAC',
    maxLength: 10,
  })
  @IsString({ message: 'code debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'code es requerido' })
  @MaxLength(10, { message: 'code no puede exceder 10 caracteres' })
  code: string;

  @ApiProperty({
    description: 'Código SWIFT/BIC del banco',
    example: 'BAMCPADP',
    required: false,
    maxLength: 11,
  })
  @IsOptional()
  @IsString({ message: 'swiftCode debe ser una cadena de texto' })
  @MaxLength(11, { message: 'swiftCode no puede exceder 11 caracteres' })
  swiftCode?: string;

  @ApiProperty({
    description: 'Nombre del banco',
    example: 'Banco de América Central',
    maxLength: 150,
  })
  @IsString({ message: 'name debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'name es requerido' })
  @MaxLength(150, { message: 'name no puede exceder 150 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Nombre corto del banco',
    example: 'BAC',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'shortName debe ser una cadena de texto' })
  @MaxLength(50, { message: 'shortName no puede exceder 50 caracteres' })
  shortName?: string;

  @ApiProperty({
    description: 'Código de país ISO 3166-1 alpha-2',
    example: 'PA',
    required: false,
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString({ message: 'countryCode debe ser una cadena de texto' })
  @Length(2, 2, { message: 'countryCode debe tener exactamente 2 caracteres' })
  countryCode?: string;

  @ApiProperty({
    description: 'Indica si el banco está activo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'ID del usuario que crea el registro',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'createdBy debe ser un ID numérico' })
  createdBy?: string;
}
