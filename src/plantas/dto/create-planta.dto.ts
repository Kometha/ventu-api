import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePlantaDto {
  @ApiProperty({
    description: 'Nombre de la planta',
    example: 'Planta Baja',
    maxLength: 120,
  })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(120, { message: 'nombre no puede exceder 120 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Codigo unico de la planta',
    example: 'PB',
    maxLength: 20,
  })
  @IsString({ message: 'codigo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'codigo es requerido' })
  @MaxLength(20, { message: 'codigo no puede exceder 20 caracteres' })
  codigo: string;

  @ApiProperty({
    description: 'Orden de la planta',
    example: 1,
  })
  @IsInt({ message: 'orden debe ser un numero entero' })
  orden: number;
}
