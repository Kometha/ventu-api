import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({
    description: 'Nombre de la categoria',
    example: 'Restaurantes',
    maxLength: 60,
  })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(60, { message: 'nombre no puede exceder 60 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Icono representativo de la categoria',
    example: 'storefront',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'icono debe ser una cadena de texto' })
  @MaxLength(100, { message: 'icono no puede exceder 100 caracteres' })
  icono?: string;
}
