import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CalificarTicketDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion: number;

  @ApiProperty({
    required: false,
    example: 'Excelente atencion, problema resuelto rapido.',
  })
  @IsOptional()
  @IsString()
  comentarioCierre?: string;
}
