import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WebsocketSessionsService {
  private readonly logger = new Logger(WebsocketSessionsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async registerSession(socketId: string, usuarioId: string): Promise<void> {
    try {
      await this.databaseService.query(
        `INSERT INTO websocket_sessions (socket_id, usuario_id, activa)
         VALUES ($1, $2, true)`,
        [socketId, usuarioId],
      );
    } catch (error) {
      this.logger.error('Error al registrar sesion WebSocket', error?.stack);
    }
  }

  async deactivateSession(socketId: string): Promise<void> {
    try {
      await this.databaseService.query(
        `UPDATE websocket_sessions
         SET activa = false, updated_at = now()
         WHERE socket_id = $1`,
        [socketId],
      );
    } catch (error) {
      this.logger.error('Error al desactivar sesion WebSocket', error?.stack);
    }
  }

  async updateTicketRoom(socketId: string, ticketId: string): Promise<void> {
    try {
      await this.databaseService.query(
        `UPDATE websocket_sessions
         SET sala_ticket_id = $1, updated_at = now()
         WHERE socket_id = $2`,
        [ticketId, socketId],
      );
    } catch (error) {
      this.logger.error('Error al actualizar sala de ticket', error?.stack);
    }
  }
}
