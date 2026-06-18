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
  @ApiProperty({ example: 'cliente@empresa.com' })
  @IsEmail({}, { message: 'email debe ser valido' })
  email: string;

  @ApiProperty({ example: 'Maria Lopez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'password debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ enum: RolUsuario, example: RolUsuario.CLIENTE })
  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @ApiProperty({ required: false, example: 'ff8482e8-1cc7-4e92-a073-bf2080142752' })
  @IsOptional()
  @IsUUID('4')
  locatarioId?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
