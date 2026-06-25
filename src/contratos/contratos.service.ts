import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { normalizeMoneda } from '../common/utils/moneda.util';
import { DatabaseService } from '../database/database.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import {
  Contrato,
  ContratoEstadoResumen,
  ContratoLocalResumen,
  ContratoLocatarioResumen,
} from './entities/contrato.entity';
import {
  ContratoResumenPorEstado,
  ContratosResumen,
} from './entities/contratos-resumen.entity';

type ContratoRow = {
  id: string;
  local_id: string;
  locatario_id: string;
  estado_contrato_id: string;
  fecha_inicio: string | Date;
  fecha_fin: string | Date;
  renta_base: string | number;
  moneda: string;
  created_at: Date;
  updated_at: Date;
  local: {
    id: string;
    nombre: string;
    codigoLocal: string;
  };
  locatario: {
    id: string;
    nombreComercial: string;
    razonSocial: string | null;
  };
  estado_contrato: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
};

const CONTRATO_SELECT = `
  c.id,
  c.local_id,
  c.locatario_id,
  c.estado_contrato_id,
  c.fecha_inicio,
  c.fecha_fin,
  c.renta_base,
  TRIM(c.moneda) AS moneda,
  c.created_at,
  c.updated_at,
  json_build_object(
    'id', l.id,
    'nombre', l.nombre,
    'codigoLocal', l.codigo_local
  ) AS local,
  json_build_object(
    'id', lo.id,
    'nombreComercial', lo.nombre_comercial,
    'razonSocial', lo.razon_social
  ) AS locatario,
  json_build_object(
    'id', ec.id,
    'nombre', ec.nombre,
    'descripcion', ec.descripcion
  ) AS estado_contrato`;

const CONTRATO_FROM = `
  FROM contratos c
  LEFT JOIN locales l ON l.id = c.local_id
  LEFT JOIN locatarios lo ON lo.id = c.locatario_id
  LEFT JOIN estados_contrato ec ON ec.id = c.estado_contrato_id`;

@Injectable()
export class ContratosService {
  private readonly logger = new Logger(ContratosService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  private formatDate(value: string | Date): string {
    return new Date(value).toISOString().slice(0, 10);
  }

  private assertFechasValidas(fechaInicio: string, fechaFin: string): void {
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      throw new BadRequestException(
        'fechaFin no puede ser anterior a fechaInicio.',
      );
    }
  }

  private mapRowToEntity(row: ContratoRow): Contrato {
    return new Contrato({
      id: row.id,
      localId: row.local_id,
      locatarioId: row.locatario_id,
      estadoContratoId: row.estado_contrato_id,
      fechaInicio: this.formatDate(row.fecha_inicio),
      fechaFin: this.formatDate(row.fecha_fin),
      rentaBase: Number(row.renta_base),
      moneda: row.moneda,
      local: new ContratoLocalResumen(row.local),
      locatario: new ContratoLocatarioResumen(row.locatario),
      estadoContrato: new ContratoEstadoResumen(row.estado_contrato),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private async findByIdWithRelations(id: string): Promise<Contrato> {
    const result = await this.databaseService.query<ContratoRow>(
      `SELECT ${CONTRATO_SELECT}
       ${CONTRATO_FROM}
       WHERE c.id = $1`,
      [id],
    );

    if (!result.rows.length) {
      throw new NotFoundException(`No existe un contrato con id ${id}`);
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe un contrato que viola una restriccion de unicidad.',
        );
      case '23503':
        throw new BadRequestException(
          'localId, locatarioId o estadoContratoId no existen en la base de datos.',
        );
      case '22P02':
        throw new BadRequestException('Uno o mas IDs no tienen formato UUID.');
      default:
        this.logger.error('Error de base de datos en contratos', error?.stack);
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de contratos.',
        );
    }
  }

  async create(createContratoDto: CreateContratoDto): Promise<Contrato> {
    if (createContratoDto.fechaInicio && createContratoDto.fechaFin) {
      this.assertFechasValidas(
        createContratoDto.fechaInicio,
        createContratoDto.fechaFin,
      );
    }

    try {
      const insert = await this.databaseService.query<{ id: string }>(
        `INSERT INTO contratos (
           local_id,
           locatario_id,
           estado_contrato_id,
           fecha_inicio,
           fecha_fin,
           renta_base,
           moneda
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          createContratoDto.localId ?? null,
          createContratoDto.locatarioId ?? null,
          createContratoDto.estadoContratoId ?? null,
          createContratoDto.fechaInicio ?? null,
          createContratoDto.fechaFin ?? null,
          createContratoDto.rentaBase ?? null,
          normalizeMoneda(createContratoDto.moneda),
        ],
      );

      return this.findByIdWithRelations(insert.rows[0].id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async getResumen(): Promise<ContratosResumen> {
    try {
      const result = await this.databaseService.query<{
        id: string;
        nombre: string;
        descripcion: string | null;
        cantidad: string | number;
      }>(
        `SELECT
           ec.id,
           ec.nombre,
           ec.descripcion,
           COUNT(c.id)::int AS cantidad
         FROM estados_contrato ec
         LEFT JOIN contratos c ON c.estado_contrato_id = ec.id
         GROUP BY ec.id, ec.nombre, ec.descripcion
         ORDER BY ec.nombre ASC`,
      );

      const porEstado = result.rows.map(
        (row) =>
          new ContratoResumenPorEstado({
            estado: new ContratoEstadoResumen({
              id: row.id,
              nombre: row.nombre,
              descripcion: row.descripcion,
            }),
            cantidad: Number(row.cantidad),
          }),
      );

      const total = porEstado.reduce((sum, item) => sum + item.cantidad, 0);

      return new ContratosResumen({ total, porEstado });
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Contrato[]> {
    try {
      const result = await this.databaseService.query<ContratoRow>(
        `SELECT ${CONTRATO_SELECT}
         ${CONTRATO_FROM}
         ORDER BY c.created_at DESC`,
      );

      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Contrato> {
    try {
      return await this.findByIdWithRelations(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async update(
    id: string,
    updateContratoDto: UpdateContratoDto,
  ): Promise<Contrato> {
    const existing = await this.findOne(id);

    const fechaInicio =
      updateContratoDto.fechaInicio ?? existing.fechaInicio;
    const fechaFin = updateContratoDto.fechaFin ?? existing.fechaFin;
    this.assertFechasValidas(fechaInicio, fechaFin);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (updateContratoDto.localId !== undefined) {
      fields.push(`local_id = $${fields.length + 1}`);
      values.push(updateContratoDto.localId);
    }
    if (updateContratoDto.locatarioId !== undefined) {
      fields.push(`locatario_id = $${fields.length + 1}`);
      values.push(updateContratoDto.locatarioId);
    }
    if (updateContratoDto.estadoContratoId !== undefined) {
      fields.push(`estado_contrato_id = $${fields.length + 1}`);
      values.push(updateContratoDto.estadoContratoId);
    }
    if (updateContratoDto.fechaInicio !== undefined) {
      fields.push(`fecha_inicio = $${fields.length + 1}`);
      values.push(updateContratoDto.fechaInicio);
    }
    if (updateContratoDto.fechaFin !== undefined) {
      fields.push(`fecha_fin = $${fields.length + 1}`);
      values.push(updateContratoDto.fechaFin);
    }
    if (updateContratoDto.rentaBase !== undefined) {
      fields.push(`renta_base = $${fields.length + 1}`);
      values.push(updateContratoDto.rentaBase);
    }
    if (updateContratoDto.moneda !== undefined) {
      fields.push(`moneda = $${fields.length + 1}`);
      values.push(normalizeMoneda(updateContratoDto.moneda));
    }

    if (!fields.length) {
      return existing;
    }

    values.push(id);

    try {
      const result = await this.databaseService.query<{ id: string }>(
        `UPDATE contratos
         SET ${fields.join(', ')}, updated_at = now()
         WHERE id = $${values.length}
         RETURNING id`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un contrato con id ${id}`);
      }

      return this.findByIdWithRelations(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.databaseService.query<{ id: string }>(
        `DELETE FROM contratos
         WHERE id = $1
         RETURNING id`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un contrato con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }
}
