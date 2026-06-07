import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class KanbanFiltersDto {
  @ApiProperty({ required: false, example: 'NUEVO' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiProperty({ required: false, example: 'ALTA' })
  @IsOptional()
  @IsString()
  prioridad?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('4')
  plantaId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('4')
  asignadoA?: string;
}
