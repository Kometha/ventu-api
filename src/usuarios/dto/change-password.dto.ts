import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password123!', description: 'Contraseña actual' })
  @IsString()
  @IsNotEmpty({ message: 'currentPassword es requerido' })
  currentPassword: string;

  @ApiProperty({
    example: 'NuevoPassword456!',
    minLength: 8,
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(8, { message: 'newPassword debe tener al menos 8 caracteres' })
  newPassword: string;
}
