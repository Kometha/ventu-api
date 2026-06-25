import { RolUsuario } from '../enums/rol-usuario.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: RolUsuario;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  locatarioId: string | null;
  empleadoId: string | null;
  avatarIniciales: string;
  fotoUrl: string | null;
  activo: boolean;
}
