import { ApiProperty } from '@nestjs/swagger';

export class TicketComentario {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  usuarioId: string;

  @ApiProperty({ nullable: true })
  usuarioNombre: string | null;

  @ApiProperty()
  contenido: string;

  @ApiProperty()
  interno: boolean;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<TicketComentario>) {
    Object.assign(this, partial);
  }
}

export class TicketHistorialEstado {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ticketId: string;

  @ApiProperty({ nullable: true })
  estadoAnterior: string | null;

  @ApiProperty()
  estadoNuevo: string;

  @ApiProperty({ nullable: true })
  cambiadoPor: string | null;

  @ApiProperty({ nullable: true })
  cambiadoPorNombre: string | null;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<TicketHistorialEstado>) {
    Object.assign(this, partial);
  }
}

export class TicketDetalle {
  @ApiProperty({ type: 'object', additionalProperties: true })
  ticket: Record<string, unknown>;

  @ApiProperty({ type: [TicketHistorialEstado] })
  historial: TicketHistorialEstado[];

  @ApiProperty({ type: [TicketComentario] })
  comentarios: TicketComentario[];

  constructor(partial: Partial<TicketDetalle>) {
    Object.assign(this, partial);
  }
}
