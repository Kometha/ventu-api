import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Notificacion } from './entities/notificacion.entity';

type NotificacionRow = {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  ticket_id: string | null;
  leida: boolean;
  enviada_ws: boolean;
  metadata: Record<string, unknown> | null;
  created_at: Date;
};

const NOTIFICACION_SELECT = `
  id, usuario_id, tipo, titulo, mensaje, ticket_id, leida, enviada_ws, metadata, created_at`;

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: NotificacionRow): Notificacion {
    return new Notificacion({
      id: row.id,
      usuarioId: row.usuario_id,
      tipo: row.tipo,
      titulo: row.titulo,
      mensaje: row.mensaje,
      ticketId: row.ticket_id,
      leida: row.leida,
      enviadaWs: row.enviada_ws,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
    });
  }

  async findByUsuario(usuarioId: string): Promise<Notificacion[]> {
    try {
      const result = await this.databaseService.query<NotificacionRow>(
        `SELECT ${NOTIFICACION_SELECT}
         FROM notificaciones
         WHERE usuario_id = $1
         ORDER BY leida ASC, created_at DESC`,
        [usuarioId],
      );

      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      this.logger.error('Error al listar notificaciones', error?.stack);
      throw new InternalServerErrorException(
        'Ocurrio un error al obtener las notificaciones.',
      );
    }
  }

  async findPendientesWs(usuarioId: string): Promise<Notificacion[]> {
    try {
      const result = await this.databaseService.query<NotificacionRow>(
        `SELECT ${NOTIFICACION_SELECT}
         FROM notificaciones
         WHERE usuario_id = $1 AND enviada_ws = false
         ORDER BY created_at ASC`,
        [usuarioId],
      );

      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      this.logger.error('Error al obtener notificaciones WS pendientes', error?.stack);
      throw new InternalServerErrorException(
        'Ocurrio un error al obtener notificaciones pendientes.',
      );
    }
  }

  async marcarEnviadasWs(ids: string[]): Promise<void> {
    if (!ids.length) return;

    await this.databaseService.query(
      `UPDATE notificaciones
       SET enviada_ws = true
       WHERE id = ANY($1::uuid[])`,
      [ids],
    );
  }

  async marcarLeida(id: string, usuarioId: string): Promise<Notificacion> {
    const result = await this.databaseService.query<NotificacionRow>(
      `UPDATE notificaciones
       SET leida = true
       WHERE id = $1 AND usuario_id = $2
       RETURNING ${NOTIFICACION_SELECT}`,
      [id, usuarioId],
    );

    if (!result.rows.length) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    return this.mapRow(result.rows[0]);
  }

  async marcarTodasLeidas(usuarioId: string): Promise<{ actualizadas: number }> {
    const result = await this.databaseService.query<{ id: string }>(
      `UPDATE notificaciones
       SET leida = true
       WHERE usuario_id = $1 AND leida = false
       RETURNING id`,
      [usuarioId],
    );

    return { actualizadas: result.rows.length };
  }
}
