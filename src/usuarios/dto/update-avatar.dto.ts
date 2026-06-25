import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAvatarDto {
  @ApiProperty({
    description:
      'URL de la imagen de perfil (normalmente la publicUrl que devuelve POST /uploads/image)',
    example:
      'https://xxxx.supabase.co/storage/v1/object/public/public/usuarios/avatars/uuid.png',
  })
  @IsString({ message: 'fotoUrl debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'fotoUrl es requerida' })
  fotoUrl: string;
}
