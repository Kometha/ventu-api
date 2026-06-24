import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDepartamentoDto {
  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Recursos Humanos',
    maxLength: 80,
  })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(80, { message: 'nombre no puede exceder 80 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del departamento',
    example: 'Gestión del talento humano',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @MaxLength(255, { message: 'descripcion no puede exceder 255 caracteres' })
  descripcion?: string;

  @ApiProperty({
    description: 'Indica si el departamento está activo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean;
}
