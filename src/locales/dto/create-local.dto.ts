import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateLocalDto {
  @ApiProperty({
    description: 'Nombre del local',
    example: 'Local A-12',
    maxLength: 120,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Codigo unico del local',
    example: 'LOC-A12',
    maxLength: 20,
  })
  @IsString({ message: 'El codigo_local debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El codigo_local es requerido' })
  @MaxLength(20, { message: 'El codigo_local no puede exceder 20 caracteres' })
  codigoLocal: string;

  @ApiProperty({
    description: 'ID de la categoria asociada',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  @IsUUID('4', { message: 'categoriaId debe ser un UUID valido' })
  categoriaId: string;

  @ApiProperty({
    description: 'ID de la planta asociada',
    example: '42f8bd8c-aa31-4cfd-8f97-e17a3ec85f63',
  })
  @IsUUID('4', { message: 'plantaId debe ser un UUID valido' })
  plantaId: string;

  @ApiProperty({
    description: 'Area del local en metros cuadrados',
    example: 45.5,
  })
  @IsNumber({}, { message: 'areaM2 debe ser numerico' })
  @IsPositive({ message: 'areaM2 debe ser mayor a 0' })
  areaM2: number;

  @ApiProperty({
    description: 'Descripcion del local',
    example: 'Local comercial en planta baja',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripcion debe ser una cadena de texto' })
  descripcion?: string;
}
