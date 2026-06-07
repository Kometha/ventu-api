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

  @ApiProperty({ required: false, example: 'f1494139-f5ff-4b69-a237-34a0be53af44' })
  @IsOptional()
  @IsUUID('4')
  localId?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
