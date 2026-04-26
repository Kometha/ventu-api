import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class ImagenLocatarioDto {
  @ApiProperty({
    description: 'URL de la imagen',
    example: 'https://cdn.miapp.com/locatarios/logo-1.png',
  })
  @IsString({ message: 'La url debe ser una cadena de texto' })
  @IsUrl({}, { message: 'La url debe tener un formato valido' })
  url: string;

  @ApiProperty({
    description: 'Orden de visualizacion',
    example: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'orden debe ser un numero entero' })
  @Min(0, { message: 'orden no puede ser negativo' })
  orden?: number;

  @ApiProperty({
    description: 'Indica si la imagen es portada',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'esPortada debe ser booleano' })
  esPortada?: boolean;
}
