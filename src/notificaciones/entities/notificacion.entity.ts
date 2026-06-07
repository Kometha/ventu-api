import { ApiProperty } from '@nestjs/swagger';

export class Notificacion {
  @ApiProperty()
  id: string;

  @ApiProperty()
  usuarioId: string;

  @ApiProperty({ example: 'TICKET_CREADO' })
  tipo: string;

  @ApiProperty({ example: 'Nuevo ticket creado' })
  titulo: string;

  @ApiProperty({ example: 'Se ha registrado un nuevo ticket de mantenimiento' })
  mensaje: string;

  @ApiProperty({ nullable: true })
  ticketId: string | null;

  @ApiProperty({ example: false })
  leida: boolean;

  @ApiProperty({ example: false })
  enviadaWs: boolean;

  @ApiProperty({ nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<Notificacion>) {
    Object.assign(this, partial);
  }
}
