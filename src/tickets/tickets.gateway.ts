import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { WebsocketSessionsService } from './websocket-sessions.service';

type SocketUser = {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
};

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/tickets',
})
export class TicketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TicketsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usuariosService: UsuariosService,
    private readonly notificacionesService: NotificacionesService,
    private readonly websocketSessionsService: WebsocketSessionsService,
  ) {}

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers?.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return null;
  }

  private async authenticateSocket(client: Socket): Promise<SocketUser | null> {
    const token = this.extractToken(client);
    if (!token) return null;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const usuario = await this.usuariosService.findById(payload.sub);
      if (!usuario || !usuario.activo) return null;

      return {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };
    } catch {
      return null;
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    const user = await this.authenticateSocket(client);
    if (!user) {
      client.disconnect(true);
      return;
    }

    client.data.user = user;
    await this.websocketSessionsService.registerSession(client.id, user.id);

    client.join(`user:${user.id}`);

    if (
      [RolUsuario.ADMIN, RolUsuario.SUPERVISOR, RolUsuario.TECNICO].includes(
        user.rol,
      )
    ) {
      client.join('admin');
    }

    await this.deliverPendingNotifications(user.id, client);
    this.logger.log(`Socket conectado: ${client.id} (usuario ${user.id})`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.websocketSessionsService.deactivateSession(client.id);
    this.logger.log(`Socket desconectado: ${client.id}`);
  }

  private async deliverPendingNotifications(
    usuarioId: string,
    client: Socket,
  ): Promise<void> {
    const pendientes =
      await this.notificacionesService.findPendientesWs(usuarioId);

    if (!pendientes.length) return;

    for (const notificacion of pendientes) {
      client.emit('notificacion', notificacion);

      if (notificacion.tipo === 'ESTADO_CAMBIADO' && notificacion.ticketId) {
        client.emit('ticket:estado_cambiado', {
          ticketId: notificacion.ticketId,
          notificacion,
        });
      }
    }

    await this.notificacionesService.marcarEnviadasWs(
      pendientes.map((n) => n.id),
    );
  }

  @SubscribeMessage('join_ticket')
  async handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() ticketId: string,
  ): Promise<{ ok: boolean; room: string }> {
    const room = `ticket:${ticketId}`;
    client.join(room);
    await this.websocketSessionsService.updateTicketRoom(client.id, ticketId);
    return { ok: true, room };
  }

  emitTicketNuevo(ticket: Record<string, unknown>): void {
    this.server.to('admin').emit('ticket:nuevo', ticket);
  }

  emitEstadoCambiado(
    creadoPor: string,
    ticketId: string,
    payload: Record<string, unknown>,
  ): void {
    this.server.to(`user:${creadoPor}`).emit('ticket:estado_cambiado', payload);
    this.server.to(`ticket:${ticketId}`).emit('ticket:estado_cambiado', payload);
  }

  emitComentario(ticketId: string, comentario: unknown): void {
    this.server.to(`ticket:${ticketId}`).emit('ticket:comentario', comentario);
  }
}
