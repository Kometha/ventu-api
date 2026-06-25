import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';
import {
  UsuarioEmpleado,
  UsuarioLocatario,
} from '../../usuarios/entities/usuario.entity';

export class AuthTokens {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: '15m' })
  expiresIn: string;

  constructor(partial: Partial<AuthTokens>) {
    Object.assign(this, partial);
  }
}

export class AuthUserProfile {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  avatarIniciales: string;

  @ApiProperty({ nullable: true })
  fotoUrl: string | null;

  @ApiProperty({ nullable: true })
  telefono: string | null;

  @ApiProperty({ enum: RolUsuario })
  rol: RolUsuario;

  @ApiProperty({ nullable: true })
  locatarioId: string | null;

  @ApiProperty({ type: UsuarioLocatario, nullable: true })
  locatario: UsuarioLocatario | null;

  @ApiProperty({ nullable: true })
  empleadoId: string | null;

  @ApiProperty({ type: UsuarioEmpleado, nullable: true })
  empleado: UsuarioEmpleado | null;

  constructor(partial: Partial<AuthUserProfile>) {
    Object.assign(this, partial);
  }
}

export class AuthResponse {
  @ApiProperty({ type: AuthTokens })
  tokens: AuthTokens;

  @ApiProperty({ type: AuthUserProfile })
  user: AuthUserProfile;

  constructor(partial: Partial<AuthResponse>) {
    Object.assign(this, partial);
  }
}
