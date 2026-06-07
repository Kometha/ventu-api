import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';

export class Usuario {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'cliente@empresa.com' })
  email: string;

  @ApiProperty({ example: 'Maria Lopez' })
  nombre: string;

  @ApiProperty({ example: 'ML' })
  avatarIniciales: string;

  @ApiProperty({ enum: RolUsuario, example: RolUsuario.CLIENTE })
  rol: RolUsuario;

  @ApiProperty({ nullable: true, example: 'f1494139-f5ff-4b69-a237-34a0be53af44' })
  localId: string | null;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ nullable: true, example: '2026-06-02T10:00:00.000Z' })
  ultimoAcceso: Date | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<Usuario>) {
    Object.assign(this, partial);
  }
}

export class UsuarioTecnico {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatarIniciales: string;

  constructor(partial: Partial<UsuarioTecnico>) {
    Object.assign(this, partial);
  }
}
