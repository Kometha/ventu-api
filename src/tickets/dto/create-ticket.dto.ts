import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4' })
  @IsUUID('4')
  categoriaId: string;

  @ApiProperty({ example: 'f1494139-f5ff-4b69-a237-34a0be53af44' })
  @IsUUID('4')
  localId: string;

  @ApiProperty({ example: '42f8bd8c-aa31-4cfd-8f97-e17a3ec85f63' })
  @IsUUID('4')
  plantaId: string;

  @ApiProperty({ example: 'Fuga de agua en bano' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @ApiProperty({ example: 'Hay una fuga constante bajo el lavamanos del local.' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 'Bano trasero, junto al almacen' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  ubicacionDetalle: string;

  @ApiProperty({
    required: false,
    example: 'ALTA',
    description: 'Si no se envia, se usa la regla SLA por defecto',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  prioridad?: string;
}
