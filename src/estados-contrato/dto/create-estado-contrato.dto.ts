import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEstadoContratoDto {
  @ApiProperty({
    description: 'Nombre del estado de contrato',
    example: 'Activo',
    maxLength: 120,
  })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(120, { message: 'nombre no puede exceder 120 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripcion del estado',
    example: 'Contrato vigente y en cumplimiento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  descripcion?: string;
}
