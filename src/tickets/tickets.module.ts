import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TicketsController } from './tickets.controller';
import { TicketsGateway } from './tickets.gateway';
import { TicketsService } from './tickets.service';
import { WebsocketSessionsService } from './websocket-sessions.service';

@Module({
  imports: [AuthModule, UsuariosModule, NotificacionesModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsGateway, WebsocketSessionsService],
  exports: [TicketsService, TicketsGateway],
})
export class TicketsModule {}
