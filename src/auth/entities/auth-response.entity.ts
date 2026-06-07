import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';

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

  @ApiProperty({ enum: RolUsuario })
  rol: RolUsuario;

  @ApiProperty({ nullable: true })
  localId: string | null;

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
