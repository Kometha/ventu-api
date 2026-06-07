import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateComentarioDto {
  @ApiProperty({ example: 'Ya estamos en camino al local.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  contenido: string;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Solo visible para staff (ADMIN/SUPERVISOR/TECNICO)',
  })
  @IsOptional()
  @IsBoolean()
  interno?: boolean;
}
