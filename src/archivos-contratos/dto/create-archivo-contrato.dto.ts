import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateArchivoContratoDto {
  @ApiProperty({ description: 'Nombre del archivo', example: 'contrato-001.pdf' })
  @IsString({ message: 'filename debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'filename es requerido' })
  filename: string;

  @ApiProperty({ description: 'URL publica del archivo en Supabase', example: 'https://xxxx.supabase.co/storage/v1/object/public/...' })
  @IsString({ message: 'url debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'url es requerido' })
  url: string;
}
