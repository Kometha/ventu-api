import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChangeEstadoDto {
  @ApiProperty({ example: 'EN_PROGRESO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  estado: string;
}
