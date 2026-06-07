import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { DatabaseService } from '../database/database.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario, UsuarioTecnico } from './entities/usuario.entity';

type UsuarioRow = {
  id: string;
  email: string;
  nombre: string;
  avatar_iniciales: string;
  rol: RolUsuario;
  local_id: string | null;
  activo: boolean;
  ultimo_acceso: Date | null;
  created_at: Date;
  updated_at: Date;
};

type UsuarioAuthRow = UsuarioRow & {
  password_hash: string;
  refresh_token: string | null;
};

const USUARIO_SELECT = `
  id, email, nombre, avatar_iniciales, rol, local_id, activo, ultimo_acceso, created_at, updated_at`;

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);
  private readonly saltRounds = 10;

  constructor(private readonly databaseService: DatabaseService) {}

  buildAvatarIniciales(nombre: string): string {
    const parts = nombre.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  private mapRowToEntity(row: UsuarioRow): Usuario {
    return new Usuario({
      id: row.id,
      email: row.email,
      nombre: row.nombre,
      avatarIniciales: row.avatar_iniciales,
      rol: row.rol,
      localId: row.local_id,
      activo: row.activo,
      ultimoAcceso: row.ultimo_acceso ? new Date(row.ultimo_acceso) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException('Ya existe un usuario con ese email.');
      case '23503':
        throw new BadRequestException('localId no existe en la base de datos.');
      case '22P02':
        throw new BadRequestException('Uno o mas IDs no tienen formato UUID.');
      default:
        this.logger.error('Error de base de datos en usuarios', error?.stack);
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de usuarios.',
        );
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async findByEmailWithAuth(email: string): Promise<UsuarioAuthRow | null> {
    const result = await this.databaseService.query<UsuarioAuthRow>(
      `SELECT ${USUARIO_SELECT}, password_hash, refresh_token
       FROM usuarios
       WHERE email = $1`,
      [email.toLowerCase()],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<Usuario | null> {
    const result = await this.databaseService.query<UsuarioRow>(
      `SELECT ${USUARIO_SELECT}
       FROM usuarios
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async findByIdOrFail(id: string): Promise<Usuario> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new NotFoundException(`No existe un usuario con id ${id}`);
    }
    return usuario;
  }

  async updateUltimoAcceso(id: string): Promise<void> {
    await this.databaseService.query(
      `UPDATE usuarios SET ultimo_acceso = now(), updated_at = now() WHERE id = $1`,
      [id],
    );
  }

  async updateRefreshToken(id: string, refreshTokenHash: string | null): Promise<void> {
    await this.databaseService.query(
      `UPDATE usuarios SET refresh_token = $1, updated_at = now() WHERE id = $2`,
      [refreshTokenHash, id],
    );
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const avatarIniciales = this.buildAvatarIniciales(createUsuarioDto.nombre);
    const passwordHash = await this.hashPassword(createUsuarioDto.password);

    try {
      const result = await this.databaseService.query<UsuarioRow>(
        `INSERT INTO usuarios (
           email, password_hash, nombre, avatar_iniciales, rol, local_id, activo
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${USUARIO_SELECT}`,
        [
          createUsuarioDto.email.toLowerCase(),
          passwordHash,
          createUsuarioDto.nombre,
          avatarIniciales,
          createUsuarioDto.rol,
          createUsuarioDto.localId ?? null,
          createUsuarioDto.activo ?? true,
        ],
      );

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Usuario[]> {
    try {
      const result = await this.databaseService.query<UsuarioRow>(
        `SELECT ${USUARIO_SELECT}
         FROM usuarios
         ORDER BY created_at DESC`,
      );
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findTecnicosDisponibles(): Promise<UsuarioTecnico[]> {
    try {
      const result = await this.databaseService.query<{
        id: string;
        nombre: string;
        email: string;
        avatar_iniciales: string;
      }>(
        `SELECT id, nombre, email, avatar_iniciales
         FROM usuarios
         WHERE rol = $1 AND activo = true
         ORDER BY nombre ASC`,
        [RolUsuario.TECNICO],
      );

      return result.rows.map(
        (row) =>
          new UsuarioTecnico({
            id: row.id,
            nombre: row.nombre,
            email: row.email,
            avatarIniciales: row.avatar_iniciales,
          }),
      );
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updateUsuarioDto.email !== undefined) {
      fields.push(`email = $${fields.length + 1}`);
      values.push(updateUsuarioDto.email.toLowerCase());
    }
    if (updateUsuarioDto.nombre !== undefined) {
      fields.push(`nombre = $${fields.length + 1}`);
      values.push(updateUsuarioDto.nombre);
      fields.push(`avatar_iniciales = $${fields.length + 1}`);
      values.push(this.buildAvatarIniciales(updateUsuarioDto.nombre));
    }
    if (updateUsuarioDto.password !== undefined) {
      const passwordHash = await this.hashPassword(updateUsuarioDto.password);
      fields.push(`password_hash = $${fields.length + 1}`);
      values.push(passwordHash);
    }
    if (updateUsuarioDto.rol !== undefined) {
      fields.push(`rol = $${fields.length + 1}`);
      values.push(updateUsuarioDto.rol);
    }
    if (updateUsuarioDto.localId !== undefined) {
      fields.push(`local_id = $${fields.length + 1}`);
      values.push(updateUsuarioDto.localId);
    }
    if (updateUsuarioDto.activo !== undefined) {
      fields.push(`activo = $${fields.length + 1}`);
      values.push(updateUsuarioDto.activo);
    }

    if (!fields.length) {
      return this.findByIdOrFail(id);
    }

    values.push(id);

    try {
      const result = await this.databaseService.query<UsuarioRow>(
        `UPDATE usuarios
         SET ${fields.join(', ')}, updated_at = now()
         WHERE id = $${values.length}
         RETURNING ${USUARIO_SELECT}`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un usuario con id ${id}`);
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.databaseService.query<{ id: string }>(
        `DELETE FROM usuarios WHERE id = $1 RETURNING id`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un usuario con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }
}
