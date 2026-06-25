import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponse,
  AuthTokens,
  AuthUserProfile,
} from './entities/auth-response.entity';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getAccessExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '15m');
  }

  private getRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  private buildUserProfile(user: Usuario): AuthUserProfile {
    return new AuthUserProfile({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      avatarIniciales: user.avatarIniciales,
      fotoUrl: user.fotoUrl,
      telefono: user.telefono,
      rol: user.rol,
      locatarioId: user.locatarioId,
      locatario: user.locatario,
      empleadoId: user.empleadoId,
      empleado: user.empleado,
    });
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    rol: RolUsuario;
  }): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };

    const accessExpiresIn = this.getAccessExpiresIn();
    const refreshExpiresIn = this.getRefreshExpiresIn();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    const refreshHash = await bcrypt.hash(refreshToken, this.saltRounds);
    await this.usuariosService.updateRefreshToken(user.id, refreshHash);

    return new AuthTokens({
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
    });
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usuariosService.findByEmailWithAuth(
      registerDto.email,
    );
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const creado = await this.usuariosService.create({
      email: registerDto.email,
      nombre: registerDto.nombre,
      password: registerDto.password,
      rol: RolUsuario.CLIENTE,
      locatarioId: registerDto.locatarioId,
      activo: true,
    });

    await this.usuariosService.updateUltimoAcceso(creado.id);

    const usuario = await this.usuariosService.findByIdOrFail(creado.id);
    const tokens = await this.generateTokens({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return new AuthResponse({
      tokens,
      user: this.buildUserProfile(usuario),
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const row = await this.usuariosService.findByEmailWithAuth(loginDto.email);

    if (!row || !row.activo) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordValid = await this.usuariosService.comparePassword(
      loginDto.password,
      row.password_hash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    await this.usuariosService.updateUltimoAcceso(row.id);

    const usuario = await this.usuariosService.findByIdOrFail(row.id);
    const tokens = await this.generateTokens({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return new AuthResponse({
      tokens,
      user: this.buildUserProfile(usuario),
    });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }

    const row = await this.usuariosService.findByEmailWithAuth(payload.email);

    if (!row || !row.activo || !row.refresh_token) {
      throw new UnauthorizedException('Sesion invalida');
    }

    const refreshValid = await bcrypt.compare(refreshToken, row.refresh_token);
    if (!refreshValid) {
      throw new UnauthorizedException('Refresh token invalido o revocado');
    }

    return this.generateTokens({
      id: row.id,
      email: row.email,
      rol: row.rol,
    });
  }

  async logout(userId: string): Promise<void> {
    await this.usuariosService.updateRefreshToken(userId, null);
  }
}
