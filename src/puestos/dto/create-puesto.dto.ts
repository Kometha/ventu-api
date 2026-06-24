import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

export class CreatePuestoDto {
  @ApiProperty({
    description: 'Nombre del puesto',
    example: 'Gerente de RRHH',
    maxLength: 100,
  })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(100, { message: 'nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del puesto',
    example: 'Responsable del área de RRHH',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @MaxLength(255, { message: 'descripcion no puede exceder 255 caracteres' })
  descripcion?: string;

  @ApiProperty({
    description: 'ID del departamento al que pertenece',
    example: 'd1d2d3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty({ message: 'departamentoId es requerido' })
  @IsUUID('4', { message: 'departamentoId debe ser un UUID valido' })
  departamentoId: string;

  @ApiProperty({
    description: 'Salario mínimo del puesto',
    example: 25000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'salarioMinimo debe ser un numero' })
  @Min(0, { message: 'salarioMinimo no puede ser negativo' })
  salarioMinimo?: number;

  @ApiProperty({
    description: 'Salario máximo del puesto',
    example: 40000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'salarioMaximo debe ser un numero' })
  @Min(0, { message: 'salarioMaximo no puede ser negativo' })
  salarioMaximo?: number;

  @ApiProperty({
    description: 'Indica si el puesto está activo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean;
}
