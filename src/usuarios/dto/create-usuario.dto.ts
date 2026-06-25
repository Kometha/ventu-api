import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';

export class CreateUsuarioDto {
  @ApiProperty({
    required: false,
    example: 'cliente@empresa.com',
    description:
      'Requerido si no se envia empleadoId. Si se envia empleadoId y se omite, se hereda el email del empleado.',
  })
  @IsOptional()
  @IsEmail({}, { message: 'email debe ser valido' })
  email?: string;

  @ApiProperty({
    required: false,
    example: 'Maria Lopez',
    description:
      'Requerido si no se envia empleadoId (el staff hereda el nombre del empleado).',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre?: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'password debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ enum: RolUsuario, example: RolUsuario.CLIENTE })
  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @ApiProperty({
    required: false,
    description: 'Empleado al que se vincula la cuenta (staff interno)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4')
  empleadoId?: string;

  @ApiProperty({
    required: false,
    example: 'ff8482e8-1cc7-4e92-a073-bf2080142752',
  })
  @IsOptional()
  @IsUUID('4')
  locatarioId?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
