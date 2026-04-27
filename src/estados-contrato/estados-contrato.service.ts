import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEstadoContratoDto } from './dto/create-estado-contrato.dto';
import { UpdateEstadoContratoDto } from './dto/update-estado-contrato.dto';
import { EstadoContrato } from './entities/estado-contrato.entity';

type EstadoContratoRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
};

@Injectable()
export class EstadosContratoService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToEntity(row: EstadoContratoRow): EstadoContrato {
    return new EstadoContrato({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe un estado de contrato con ese nombre.',
        );
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'No se puede eliminar el estado porque esta siendo utilizado por otros registros.',
        );
      default:
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de estados de contrato.',
        );
    }
  }

  async create(
    createEstadoContratoDto: CreateEstadoContratoDto,
  ): Promise<EstadoContrato> {
    try {
      const result = await this.databaseService.query<EstadoContratoRow>(
        `INSERT INTO estados_contrato (nombre, descripcion)
         VALUES ($1, $2)
         RETURNING id, nombre, descripcion`,
        [createEstadoContratoDto.nombre, createEstadoContratoDto.descripcion ?? null],
      );

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<EstadoContrato[]> {
    try {
      const result = await this.databaseService.query<EstadoContratoRow>(
        `SELECT id, nombre, descripcion
         FROM estados_contrato
         ORDER BY nombre ASC`,
      );

      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<EstadoContrato> {
    try {
      const result = await this.databaseService.query<EstadoContratoRow>(
        `SELECT id, nombre, descripcion
         FROM estados_contrato
         WHERE id = $1`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(
          `No existe un estado de contrato con id ${id}`,
        );
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async update(
    id: string,
    updateEstadoContratoDto: UpdateEstadoContratoDto,
  ): Promise<EstadoContrato> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updateEstadoContratoDto.nombre !== undefined) {
      fields.push(`nombre = $${fields.length + 1}`);
      values.push(updateEstadoContratoDto.nombre);
    }
    if (updateEstadoContratoDto.descripcion !== undefined) {
      fields.push(`descripcion = $${fields.length + 1}`);
      values.push(updateEstadoContratoDto.descripcion);
    }

    if (!fields.length) {
      return this.findOne(id);
    }

    values.push(id);

    try {
      const result = await this.databaseService.query<EstadoContratoRow>(
        `UPDATE estados_contrato
         SET ${fields.join(', ')}
         WHERE id = $${values.length}
         RETURNING id, nombre, descripcion`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(
          `No existe un estado de contrato con id ${id}`,
        );
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.databaseService.query<{ id: string }>(
        `DELETE FROM estados_contrato
         WHERE id = $1
         RETURNING id`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(
          `No existe un estado de contrato con id ${id}`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }
}
