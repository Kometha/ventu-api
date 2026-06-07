import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { Notificacion } from './entities/notificacion.entity';
import { NotificacionesService } from './notificaciones.service';

@ApiTags('notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar notificaciones del usuario autenticado (no leidas primero)',
  })
  @ApiResponse({ status: 200, type: [Notificacion] })
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<Notificacion[]> {
    return this.notificacionesService.findByUsuario(user.id);
  }

  @Patch('leer-todas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leidas' })
  marcarTodasLeidas(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ actualizadas: number }> {
    return this.notificacionesService.marcarTodasLeidas(user.id);
  }

  @Patch(':id/leida')
  @ApiOperation({ summary: 'Marcar una notificacion como leida' })
  @ApiParam({ name: 'id', description: 'UUID de la notificacion' })
  @ApiResponse({ status: 200, type: Notificacion })
  marcarLeida(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Notificacion> {
    return this.notificacionesService.marcarLeida(id, user.id);
  }
}
