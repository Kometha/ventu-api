import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    description: 'Carpeta destino dentro del bucket',
    example: 'locatarios/logos',
    required: false,
    maxLength: 120,
  })
  @IsOptional()
  @IsString({ message: 'folder debe ser una cadena de texto' })
  @MaxLength(120, { message: 'folder no puede exceder 120 caracteres' })
  @Matches(/^[a-zA-Z0-9/_-]+$/, {
    message: 'folder solo permite letras, numeros, slash, guion y guion bajo',
  })
  folder?: string;
}
