import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { DatabaseService } from '../database/database.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import {
  Usuario,
  UsuarioEmpleado,
  UsuarioLocatario,
  UsuarioTecnico,
} from './entities/usuario.entity';

// Fila con los datos de display ya resueltos (empleado > usuario > locatario)
type UsuarioRow = {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  foto_url: string | null;
  rol: RolUsuario;
  locatario_id: string | null;
  empleado_id: string | null;
  activo: boolean;
  ultimo_acceso: Date | null;
  created_at: Date;
  updated_at: Date;
};

type UsuarioRowDetallado = UsuarioRow & {
  locatario_nombre: string | null;
  locatario_categoria_id: string | null;
  locatario_categoria_nombre: string | null;
  locatario_local_id: string | null;
  locatario_local_nombre: string | null;
  locatario_planta_id: string | null;
  locatario_planta_nombre: string | null;
  empleado_codigo: string | null;
  empleado_puesto_id: string | null;
  empleado_puesto_nombre: string | null;
  empleado_departamento_id: string | null;
  empleado_departamento_nombre: string | null;
};

// Solo campos de autenticacion; no necesita los datos de display.
type UsuarioAuthRow = {
  id: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  password_hash: string;
  refresh_token: string | null;
};

// SELECT base con los datos de display resueltos sin duplicar informacion.
const USUARIO_SELECT_RESUELTO = `
  u.id, u.email, u.rol, u.locatario_id, u.empleado_id, u.activo,
  u.ultimo_acceso, u.created_at, u.updated_at,
  COALESCE(
    NULLIF(TRIM(CONCAT_WS(' ', e.nombres, e.apellidos)), ''),
    u.nombre,
    l.nombre_comercial
  ) AS nombre,
  COALESCE(e.telefono, u.telefono) AS telefono,
  COALESCE(e.foto_url, u.avatar_url) AS foto_url`;

const FROM_RESUELTO = `
  FROM usuarios u
  LEFT JOIN empleados e  ON e.id = u.empleado_id
  LEFT JOIN locatarios l ON l.id = u.locatario_id`;

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);
  private readonly saltRounds = 10;

  constructor(private readonly databaseService: DatabaseService) {}

  buildAvatarIniciales(nombre: string | null): string {
    const parts = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  private mapRowToEntity(row: UsuarioRow | UsuarioRowDetallado): Usuario {
    const detallado = 'locatario_nombre' in row;

    const locatario =
      detallado && row.locatario_id && row.locatario_nombre
        ? new UsuarioLocatario({
            id: row.locatario_id,
            nombre: row.locatario_nombre,
            categoriaId: row.locatario_categoria_id,
            categoriaNombre: row.locatario_categoria_nombre,
            localId: row.locatario_local_id,
            localNombre: row.locatario_local_nombre,
            plantaId: row.locatario_planta_id,
            plantaNombre: row.locatario_planta_nombre,
          })
        : null;

    const empleado =
      detallado && row.empleado_id
        ? new UsuarioEmpleado({
            id: row.empleado_id,
            codigoEmpleado: row.empleado_codigo ?? '',
            puestoId: row.empleado_puesto_id,
            puestoNombre: row.empleado_puesto_nombre,
            departamentoId: row.empleado_departamento_id,
            departamentoNombre: row.empleado_departamento_nombre,
          })
        : null;

    return new Usuario({
      id: row.id,
      email: row.email,
      nombre: row.nombre ?? '',
      avatarIniciales: this.buildAvatarIniciales(row.nombre),
      fotoUrl: row.foto_url,
      telefono: row.telefono,
      rol: row.rol,
      locatarioId: row.locatario_id,
      locatario,
      empleadoId: row.empleado_id,
      empleado,
      activo: row.activo,
      ultimoAcceso: row.ultimo_acceso ? new Date(row.ultimo_acceso) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe un usuario con ese email, o el empleado ya tiene una cuenta asociada.',
        );
      case '23503':
        throw new BadRequestException(
          'El empleado o locatario indicado no existe en la base de datos.',
        );
      case '23514':
        throw new BadRequestException(
          'Un usuario no puede estar vinculado a un empleado y a un locatario al mismo tiempo.',
        );
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
      `SELECT id, email, rol, activo, password_hash, refresh_token
       FROM usuarios
       WHERE email = $1`,
      [email.toLowerCase()],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<Usuario | null> {
    const result = await this.databaseService.query<UsuarioRowDetallado>(
      `SELECT ${USUARIO_SELECT_RESUELTO},
              l.nombre_comercial AS locatario_nombre,
              l.categoria_id     AS locatario_categoria_id,
              cat.nombre         AS locatario_categoria_nombre,
              lo.id              AS locatario_local_id,
              lo.nombre          AS locatario_local_nombre,
              lo.planta_id       AS locatario_planta_id,
              pl.nombre          AS locatario_planta_nombre,
              e.codigo_empleado  AS empleado_codigo,
              e.puesto_id        AS empleado_puesto_id,
              pue.nombre         AS empleado_puesto_nombre,
              e.departamento_id  AS empleado_departamento_id,
              dep.nombre         AS empleado_departamento_nombre
       ${FROM_RESUELTO}
       LEFT JOIN categorias cat ON cat.id = l.categoria_id
       LEFT JOIN LATERAL (
         SELECT c.local_id
         FROM contratos c
         WHERE c.locatario_id = l.id
         ORDER BY c.fecha_inicio DESC
         LIMIT 1
       ) c ON true
       LEFT JOIN locales lo ON lo.id = c.local_id
       LEFT JOIN plantas pl ON pl.id = lo.planta_id
       LEFT JOIN puestos pue ON pue.id = e.puesto_id
       LEFT JOIN departamentos dep ON dep.id = e.departamento_id
       WHERE u.id = $1`,
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

  async updateRefreshToken(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.databaseService.query(
      `UPDATE usuarios SET refresh_token = $1, updated_at = now() WHERE id = $2`,
      [refreshTokenHash, id],
    );
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const esStaff = !!createUsuarioDto.empleadoId;

    // Resolver email/nombre. Para staff se pueden heredar del empleado.
    let email = createUsuarioDto.email ?? null;
    if (esStaff) {
      const emp = await this.databaseService.query<{ email: string | null }>(
        `SELECT email FROM empleados WHERE id = $1`,
        [createUsuarioDto.empleadoId],
      );
      if (!emp.rows.length) {
        throw new BadRequestException('El empleado indicado no existe.');
      }
      email = email ?? emp.rows[0].email;
    } else if (!createUsuarioDto.nombre) {
      throw new BadRequestException(
        'nombre es requerido cuando el usuario no se vincula a un empleado.',
      );
    }

    if (!email) {
      throw new BadRequestException(
        'email es requerido (el empleado vinculado no tiene email registrado).',
      );
    }

    // Para staff no duplicamos nombre/iniciales: se derivan del empleado.
    const nombre = esStaff ? null : (createUsuarioDto.nombre ?? null);
    const avatarIniciales = esStaff
      ? null
      : this.buildAvatarIniciales(createUsuarioDto.nombre ?? null);
    const passwordHash = await this.hashPassword(createUsuarioDto.password);

    try {
      const inserted = await this.databaseService.query<{ id: string }>(
        `INSERT INTO usuarios (
           email, password_hash, nombre, avatar_iniciales, rol,
           empleado_id, locatario_id, activo
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          email.toLowerCase(),
          passwordHash,
          nombre,
          avatarIniciales,
          createUsuarioDto.rol,
          createUsuarioDto.empleadoId ?? null,
          createUsuarioDto.locatarioId ?? null,
          createUsuarioDto.activo ?? true,
        ],
      );

      return this.findByIdOrFail(inserted.rows[0].id);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Usuario[]> {
    try {
      const result = await this.databaseService.query<UsuarioRow>(
        `SELECT ${USUARIO_SELECT_RESUELTO}
         ${FROM_RESUELTO}
         ORDER BY u.created_at DESC`,
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
        nombre: string | null;
        email: string;
      }>(
        `SELECT u.id, u.email,
                COALESCE(
                  NULLIF(TRIM(CONCAT_WS(' ', e.nombres, e.apellidos)), ''),
                  u.nombre
                ) AS nombre
         FROM usuarios u
         LEFT JOIN empleados e ON e.id = u.empleado_id
         WHERE u.rol = $1 AND u.activo = true
         ORDER BY nombre ASC`,
        [RolUsuario.TECNICO],
      );

      return result.rows.map(
        (row) =>
          new UsuarioTecnico({
            id: row.id,
            nombre: row.nombre ?? '',
            email: row.email,
            avatarIniciales: this.buildAvatarIniciales(row.nombre),
          }),
      );
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
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
    if (updateUsuarioDto.empleadoId !== undefined) {
      fields.push(`empleado_id = $${fields.length + 1}`);
      values.push(updateUsuarioDto.empleadoId);
    }
    if (updateUsuarioDto.locatarioId !== undefined) {
      fields.push(`locatario_id = $${fields.length + 1}`);
      values.push(updateUsuarioDto.locatarioId);
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
      const result = await this.databaseService.query<{ id: string }>(
        `UPDATE usuarios
         SET ${fields.join(', ')}, updated_at = now()
         WHERE id = $${values.length}
         RETURNING id`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un usuario con id ${id}`);
      }

      return this.findByIdOrFail(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  /**
   * Cambia la contraseña validando la actual. Revoca el refresh token vigente.
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const result = await this.databaseService.query<{ password_hash: string }>(
      `SELECT password_hash FROM usuarios WHERE id = $1`,
      [id],
    );

    if (!result.rows.length) {
      throw new NotFoundException(`No existe un usuario con id ${id}`);
    }

    const valido = await this.comparePassword(
      currentPassword,
      result.rows[0].password_hash,
    );
    if (!valido) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    const newHash = await this.hashPassword(newPassword);
    await this.databaseService.query(
      `UPDATE usuarios
       SET password_hash = $1, refresh_token = NULL, updated_at = now()
       WHERE id = $2`,
      [newHash, id],
    );
  }

  /**
   * Actualiza la foto de perfil. Si el usuario es staff (tiene empleado),
   * la foto se guarda en empleados.foto_url (fuente unica); de lo contrario
   * en usuarios.avatar_url.
   */
  async updateAvatar(id: string, fotoUrl: string): Promise<Usuario> {
    const result = await this.databaseService.query<{
      empleado_id: string | null;
    }>(`SELECT empleado_id FROM usuarios WHERE id = $1`, [id]);

    if (!result.rows.length) {
      throw new NotFoundException(`No existe un usuario con id ${id}`);
    }

    const empleadoId = result.rows[0].empleado_id;
    try {
      if (empleadoId) {
        await this.databaseService.query(
          `UPDATE empleados SET foto_url = $1, updated_at = now() WHERE id = $2`,
          [fotoUrl, empleadoId],
        );
      } else {
        await this.databaseService.query(
          `UPDATE usuarios SET avatar_url = $1, updated_at = now() WHERE id = $2`,
          [fotoUrl, id],
        );
      }
      return this.findByIdOrFail(id);
    } catch (error) {
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
