import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { mapRowToCamel } from '../common/utils/snake-to-camel.util';
import { DatabaseService } from '../database/database.service';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { CalificarTicketDto } from './dto/calificar-ticket.dto';
import { ChangeEstadoDto } from './dto/change-estado.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { KanbanFiltersDto } from './dto/kanban-filters.dto';
import {
  TicketComentario,
  TicketDetalle,
  TicketHistorialEstado,
} from './entities/ticket.entity';

type TicketRow = {
  id: string;
  categoria_id: string;
  local_id: string;
  planta_id: string;
  creado_por: string;
  asignado_a: string | null;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  ubicacion_detalle: string;
  sla_horas: number;
  fecha_limite: Date | null;
  fecha_inicio_trabajo: Date | null;
  fecha_resolucion: Date | null;
  cerrado: boolean;
  calificacion: number | null;
  comentario_cierre: string | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23503':
        throw new BadRequestException(
          'Una o mas referencias (categoria, local, planta, usuario) no existen.',
        );
      case '22P02':
        throw new BadRequestException('Uno o mas IDs no tienen formato UUID.');
      default:
        this.logger.error('Error de base de datos en tickets', error?.stack);
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de tickets.',
        );
    }
  }

  private async getSlaHoras(prioridad: string): Promise<number> {
    const result = await this.databaseService.query<{ horas: number }>(
      `SELECT horas_resolucion AS horas
       FROM sla_reglas
       WHERE prioridad = $1
       LIMIT 1`,
      [prioridad],
    );

    if (!result.rows.length) {
      throw new BadRequestException(
        `No existe una regla SLA para la prioridad ${prioridad}`,
      );
    }

    return Number(result.rows[0].horas);
  }

  private async resolvePrioridad(prioridad?: string): Promise<string> {
    if (prioridad) return prioridad.toUpperCase();

    const result = await this.databaseService.query<{ prioridad: string }>(
      `SELECT prioridad
       FROM sla_reglas
       ORDER BY horas DESC
       LIMIT 1`,
    );

    return result.rows[0]?.prioridad ?? 'MEDIA';
  }

  async create(
    createTicketDto: CreateTicketDto,
    user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    if (user.rol !== RolUsuario.CLIENTE) {
      throw new ForbiddenException('Solo clientes pueden crear tickets');
    }

    const prioridad = await this.resolvePrioridad(createTicketDto.prioridad);
    const slaHoras = await this.getSlaHoras(prioridad);

    try {
      const result = await this.databaseService.query<TicketRow>(
        `INSERT INTO tickets (
           categoria_id, local_id, planta_id, creado_por,
           titulo, descripcion, ubicacion_detalle,
           estado, prioridad, sla_horas
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'NUEVO', $8, $9)
         RETURNING *`,
        [
          createTicketDto.categoriaId,
          createTicketDto.localId,
          createTicketDto.plantaId,
          user.id,
          createTicketDto.titulo,
          createTicketDto.descripcion,
          createTicketDto.ubicacionDetalle,
          prioridad,
          slaHoras,
        ],
      );

      return mapRowToCamel(result.rows[0]);
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async findKanban(
    filters: KanbanFiltersDto,
  ): Promise<Record<string, unknown>[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.estado) {
      values.push(filters.estado);
      conditions.push(`estado = $${values.length}`);
    }
    if (filters.prioridad) {
      values.push(filters.prioridad);
      conditions.push(`prioridad = $${values.length}`);
    }
    if (filters.plantaId) {
      values.push(filters.plantaId);
      conditions.push(`planta_id = $${values.length}`);
    }
    if (filters.asignadoA) {
      values.push(filters.asignadoA);
      conditions.push(`asignado_a = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    try {
      const result = await this.databaseService.query<Record<string, unknown>>(
        `SELECT * FROM v_kanban_tickets ${whereClause} ORDER BY created_at DESC`,
        values,
      );

      return result.rows.map((row) => mapRowToCamel(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findMisTickets(userId: string): Promise<Record<string, unknown>[]> {
    try {
      const result = await this.databaseService.query<Record<string, unknown>>(
        `SELECT * FROM v_mis_tickets
         WHERE usuario_id = $1
         ORDER BY created_at DESC`,
        [userId],
      );

      return result.rows.map((row) => mapRowToCamel(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getTicketBase(id: string): Promise<TicketRow> {
    const result = await this.databaseService.query<TicketRow>(
      `SELECT * FROM tickets WHERE id = $1`,
      [id],
    );

    if (!result.rows.length) {
      throw new NotFoundException(`No existe un ticket con id ${id}`);
    }

    return result.rows[0];
  }

  async findDetalle(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketDetalle> {
    const ticket = await this.getTicketBase(id);

    if (
      user.rol === RolUsuario.CLIENTE &&
      ticket.creado_por !== user.id
    ) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    const historialResult = await this.databaseService.query<{
      id: string;
      ticket_id: string;
      estado_anterior: string | null;
      estado_nuevo: string;
      cambiado_por: string | null;
      cambiado_por_nombre: string | null;
      created_at: Date;
    }>(
      `SELECT
         h.id,
         h.ticket_id,
         h.estado_anterior,
         h.estado_nuevo,
         h.cambiado_por,
         u.nombre AS cambiado_por_nombre,
         h.created_at
       FROM ticket_historial_estados h
       LEFT JOIN usuarios u ON u.id = h.cambiado_por
       WHERE h.ticket_id = $1
       ORDER BY h.created_at ASC`,
      [id],
    );

    const incluirInternos = user.rol !== RolUsuario.CLIENTE;

    const comentariosResult = await this.databaseService.query<{
      id: string;
      ticket_id: string;
      autor_id: string;
      usuario_nombre: string | null;
      mensaje: string;
      interno: boolean;
      created_at: Date;
    }>(
      `SELECT
         c.id,
         c.ticket_id,
         c.autor_id,
         u.nombre AS usuario_nombre,
         c.mensaje,
         c.interno,
         c.created_at
       FROM ticket_comentarios c
       LEFT JOIN usuarios u ON u.id = c.autor_id
       WHERE c.ticket_id = $1
         AND ($2::boolean = true OR c.interno = false)
       ORDER BY c.created_at ASC`,
      [id, incluirInternos],
    );

    return new TicketDetalle({
      ticket: mapRowToCamel(ticket),
      historial: historialResult.rows.map(
        (row) =>
          new TicketHistorialEstado({
            id: row.id,
            ticketId: row.ticket_id,
            estadoAnterior: row.estado_anterior,
            estadoNuevo: row.estado_nuevo,
            cambiadoPor: row.cambiado_por,
            cambiadoPorNombre: row.cambiado_por_nombre,
            createdAt: new Date(row.created_at),
          }),
      ),
      comentarios: comentariosResult.rows.map(
        (row) =>
          new TicketComentario({
            id: row.id,
            ticketId: row.ticket_id,
            usuarioId: row.autor_id,
            usuarioNombre: row.usuario_nombre,
            contenido: row.mensaje,
            interno: row.interno,
            createdAt: new Date(row.created_at),
          }),
      ),
    });
  }

  async changeEstado(
    id: string,
    changeEstadoDto: ChangeEstadoDto,
  ): Promise<Record<string, unknown>> {
    const ticket = await this.getTicketBase(id);

    try {
      const result = await this.databaseService.query<TicketRow>(
        `UPDATE tickets
         SET estado = $1, updated_at = now()
         WHERE id = $2
         RETURNING *`,
        [changeEstadoDto.estado, id],
      );

      return {
        ticket: mapRowToCamel(result.rows[0]),
        creadoPor: ticket.creado_por,
      };
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async asignarTecnico(
    id: string,
    asignarTecnicoDto: AsignarTecnicoDto,
  ): Promise<Record<string, unknown>> {
    await this.getTicketBase(id);

    try {
      const result = await this.databaseService.query<TicketRow>(
        `UPDATE tickets
         SET asignado_a = $1, updated_at = now()
         WHERE id = $2
         RETURNING *`,
        [asignarTecnicoDto.asignadoA, id],
      );

      return mapRowToCamel(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async addComentario(
    id: string,
    createComentarioDto: CreateComentarioDto,
    user: AuthenticatedUser,
  ): Promise<TicketComentario> {
    await this.getTicketBase(id);

    const esStaff = [
      RolUsuario.ADMIN,
      RolUsuario.SUPERVISOR,
      RolUsuario.TECNICO,
    ].includes(user.rol);

    if (createComentarioDto.interno && !esStaff) {
      throw new ForbiddenException(
        'Solo el staff puede crear comentarios internos',
      );
    }

    try {
      const result = await this.databaseService.query<{
        id: string;
        ticket_id: string;
        autor_id: string;
        mensaje: string;
        interno: boolean;
        created_at: Date;
      }>(
        `INSERT INTO ticket_comentarios (ticket_id, autor_id, mensaje, interno)
         VALUES ($1, $2, $3, $4)
         RETURNING id, ticket_id, autor_id, mensaje, interno, created_at`,
        [
          id,
          user.id,
          createComentarioDto.contenido,
          createComentarioDto.interno ?? false,
        ],
      );

      const row = result.rows[0];

      return new TicketComentario({
        id: row.id,
        ticketId: row.ticket_id,
        usuarioId: row.autor_id,
        usuarioNombre: user.nombre,
        contenido: row.mensaje,
        interno: row.interno,
        createdAt: new Date(row.created_at),
      });
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.handleDbError(error);
    }
  }

  async calificar(
    id: string,
    calificarTicketDto: CalificarTicketDto,
    user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    const ticket = await this.getTicketBase(id);

    if (ticket.creado_por !== user.id) {
      throw new ForbiddenException('Solo el creador puede calificar el ticket');
    }

    try {
      const result = await this.databaseService.query<TicketRow>(
        `UPDATE tickets
         SET calificacion = $1,
             comentario_cierre = $2,
             updated_at = now()
         WHERE id = $3
         RETURNING *`,
        [
          calificarTicketDto.calificacion,
          calificarTicketDto.comentarioCierre ?? null,
          id,
        ],
      );

      return mapRowToCamel(result.rows[0]);
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.handleDbError(error);
    }
  }
}
