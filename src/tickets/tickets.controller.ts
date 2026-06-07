import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { CalificarTicketDto } from './dto/calificar-ticket.dto';
import { ChangeEstadoDto } from './dto/change-estado.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { KanbanFiltersDto } from './dto/kanban-filters.dto';
import { TicketComentario, TicketDetalle } from './entities/ticket.entity';
import { TicketsGateway } from './tickets.gateway';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly ticketsGateway: TicketsGateway,
  ) {}

  @Post()
  @Roles(RolUsuario.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear ticket (CLIENTE)' })
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    const ticket = await this.ticketsService.create(createTicketDto, user);
    this.ticketsGateway.emitTicketNuevo(ticket);
    return ticket;
  }

  @Get('kanban')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPERVISOR, RolUsuario.TECNICO)
  @ApiOperation({ summary: 'Listar tickets para tablero Kanban (staff)' })
  findKanban(
    @Query() filters: KanbanFiltersDto,
  ): Promise<Record<string, unknown>[]> {
    return this.ticketsService.findKanban(filters);
  }

  @Get('mis-tickets')
  @Roles(RolUsuario.CLIENTE)
  @ApiOperation({ summary: 'Listar tickets del cliente autenticado' })
  findMisTickets(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Record<string, unknown>[]> {
    return this.ticketsService.findMisTickets(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de ticket con historial y comentarios' })
  @ApiParam({ name: 'id', description: 'UUID del ticket' })
  @ApiResponse({ status: 200, type: TicketDetalle })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketDetalle> {
    return this.ticketsService.findDetalle(id, user);
  }

  @Patch(':id/estado')
  @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
  @ApiOperation({
    summary: 'Cambiar estado del ticket (trigger BD registra historial y notificacion)',
  })
  async changeEstado(
    @Param('id') id: string,
    @Body() changeEstadoDto: ChangeEstadoDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.ticketsService.changeEstado(id, changeEstadoDto);
    const ticket = result.ticket as Record<string, unknown>;
    const creadoPor = result.creadoPor as string;

    this.ticketsGateway.emitEstadoCambiado(creadoPor, id, {
      ticketId: id,
      estado: changeEstadoDto.estado,
      ticket,
    });

    return ticket;
  }

  @Patch(':id/asignar')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPERVISOR)
  @ApiOperation({ summary: 'Asignar tecnico al ticket' })
  asignarTecnico(
    @Param('id') id: string,
    @Body() asignarTecnicoDto: AsignarTecnicoDto,
  ): Promise<Record<string, unknown>> {
    return this.ticketsService.asignarTecnico(id, asignarTecnicoDto);
  }

  @Post(':id/comentarios')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar comentario al ticket' })
  async addComentario(
    @Param('id') id: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketComentario> {
    const comentario = await this.ticketsService.addComentario(
      id,
      createComentarioDto,
      user,
    );
    this.ticketsGateway.emitComentario(id, comentario);
    return comentario;
  }

  @Patch(':id/calificar')
  @Roles(RolUsuario.CLIENTE)
  @ApiOperation({ summary: 'Calificar ticket al cerrar (CLIENTE creador)' })
  calificar(
    @Param('id') id: string,
    @Body() calificarTicketDto: CalificarTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    return this.ticketsService.calificar(id, calificarTicketDto, user);
  }
}
