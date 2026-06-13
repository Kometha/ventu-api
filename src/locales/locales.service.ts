import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { Local } from './entities/local.entity';

type LocalRow = {
  id: string;
  nombre: string;
  codigo_local: string;
  categoria_id: string;
  planta_id: string;
  area_m2: string | number;
  ocupado: boolean | null;
  descripcion: string | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class LocalesService {
  private readonly logger = new Logger(LocalesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToEntity(row: LocalRow): Local {
    return new Local({
      id: row.id,
      nombre: row.nombre,
      codigoLocal: row.codigo_local,
      plantaId: row.planta_id,
      areaM2: Number(row.area_m2),
      ocupado: row.ocupado,
      descripcion: row.descripcion,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe un local con ese codigo_local.',
        );
      case '23503':
        throw new BadRequestException(
          'categoria_id o planta_id no existen en la base de datos.',
        );
      case '22P02':
        throw new BadRequestException('Uno o mas IDs no tienen formato UUID.');
      default:
        this.logger.error('Error de base de datos en locales', error?.stack);
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de locales.',
        );
    }
  }

  async create(createLocalDto: CreateLocalDto): Promise<Local> {
    try {
      const result = await this.databaseService.query<LocalRow>(
        `INSERT INTO locales (nombre, codigo_local, planta_id, area_m2, descripcion)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nombre, codigo_local, planta_id, area_m2, ocupado, descripcion, created_at, updated_at`,
        [
          createLocalDto.nombre,
          createLocalDto.codigoLocal,
          createLocalDto.plantaId,
          createLocalDto.areaM2,
          createLocalDto.descripcion ?? null,
        ],
      );

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Local[]> {
    try {
      const result = await this.databaseService.query<LocalRow>(
        `SELECT id, nombre, codigo_local, planta_id, area_m2, ocupado, descripcion, created_at, updated_at
         FROM locales
         ORDER BY created_at DESC`,
      );

      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Local> {
    try {
      const result = await this.databaseService.query<LocalRow>(
        `SELECT id, nombre, codigo_local, planta_id, area_m2, ocupado, descripcion, created_at, updated_at
         FROM locales
         WHERE id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`No existe un local con id ${id}`);
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async update(id: string, updateLocalDto: UpdateLocalDto): Promise<Local> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updateLocalDto.nombre !== undefined) {
      fields.push(`nombre = $${fields.length + 1}`);
      values.push(updateLocalDto.nombre);
    }
    if (updateLocalDto.codigoLocal !== undefined) {
      fields.push(`codigo_local = $${fields.length + 1}`);
      values.push(updateLocalDto.codigoLocal);
    }
    if (updateLocalDto.plantaId !== undefined) {
      fields.push(`planta_id = $${fields.length + 1}`);
      values.push(updateLocalDto.plantaId);
    }
    if (updateLocalDto.areaM2 !== undefined) {
      fields.push(`area_m2 = $${fields.length + 1}`);
      values.push(updateLocalDto.areaM2);
    }
    if (updateLocalDto.descripcion !== undefined) {
      fields.push(`descripcion = $${fields.length + 1}`);
      values.push(updateLocalDto.descripcion);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    values.push(id);

    try {
      const result = await this.databaseService.query<LocalRow>(
        `UPDATE locales
         SET ${fields.join(', ')}, updated_at = now()
         WHERE id = $${values.length}
         RETURNING id, nombre, codigo_local, planta_id, area_m2, ocupado, descripcion, created_at, updated_at`,
        values,
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`No existe un local con id ${id}`);
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
        `DELETE FROM locales
         WHERE id = $1
         RETURNING id`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`No existe un local con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }
}
