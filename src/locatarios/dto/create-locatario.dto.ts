import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateLocatarioDto {
  @ApiProperty({
    description: 'Nombre comercial del locatario',
    example: 'Cafe Central',
    maxLength: 120,
  })
  @IsString({ message: 'nombreComercial debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombreComercial es requerido' })
  @MaxLength(120, { message: 'nombreComercial no puede exceder 120 caracteres' })
  nombreComercial: string;

  @ApiProperty({
    description: 'Razon social',
    example: 'Cafe Central S.A.',
    maxLength: 180,
  })
  @IsNotEmpty({ message: 'razonSocial es requerido' })
  @IsString({ message: 'razonSocial debe ser una cadena de texto' })
  @MaxLength(180, { message: 'razonSocial no puede exceder 180 caracteres' })
  razonSocial: string;

  @ApiProperty({
    description: 'Categoria del locatario',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  @IsUUID('4', { message: 'categoriaId debe ser un UUID valido' })
  categoriaId: string;

  @ApiProperty({
    description: 'RTN unico',
    example: '08011999123960',
    maxLength: 20,
  })
  @IsString({ message: 'rtn debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'rtn es requerido' })
  @MaxLength(20, { message: 'rtn no puede exceder 20 caracteres' })
  rtn: string;

  @ApiProperty({
    description: 'Telefono de contacto',
    example: '+504 2222-3333',
    maxLength: 30,
  })
  @IsString({ message: 'telefono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'telefono es requerido' })
  @MaxLength(30, { message: 'telefono no puede exceder 30 caracteres' })
  telefono: string;

  @ApiProperty({
    description: 'Correo electronico',
    example: 'contacto@cafecentral.com',
    maxLength: 120,
  })
  @IsNotEmpty({ message: 'email es requerido' })
  @IsEmail({}, { message: 'email no tiene un formato valido' })
  @MaxLength(120, { message: 'email no puede exceder 120 caracteres' })
  email: string;

  @ApiProperty({
    description: 'URL del logo principal',
    example: 'https://cdn.miapp.com/locatarios/logo-principal.png',
  })
  @IsNotEmpty({ message: 'logoUrl es requerido' })
  @IsString({ message: 'logoUrl debe ser una cadena de texto' })
  @MaxLength(250, { message: 'logoUrl no puede exceder 250 caracteres' })
  logoUrl: string;
}
