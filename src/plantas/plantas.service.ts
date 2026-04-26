import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePlantaDto } from './dto/create-planta.dto';
import { UpdatePlantaDto } from './dto/update-planta.dto';
import { Planta } from './entities/planta.entity';

type PlantaRow = {
  id: string;
  nombre: string;
  codigo: string;
  orden: number;
};

@Injectable()
export class PlantasService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToEntity(row: PlantaRow): Planta {
    return new Planta({
      id: row.id,
      nombre: row.nombre,
      codigo: row.codigo,
      orden: Number(row.orden),
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException('Ya existe una planta con ese codigo.');
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'No se puede eliminar la planta porque esta siendo utilizada por otros registros.',
        );
      default:
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de plantas.',
        );
    }
  }

  async create(createPlantaDto: CreatePlantaDto): Promise<Planta> {
    try {
      const result = await this.databaseService.query<PlantaRow>(
        `INSERT INTO plantas (nombre, codigo, orden)
         VALUES ($1, $2, $3)
         RETURNING id, nombre, codigo, orden`,
        [createPlantaDto.nombre, createPlantaDto.codigo, createPlantaDto.orden],
      );

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Planta[]> {
    try {
      const result = await this.databaseService.query<PlantaRow>(
        `SELECT id, nombre, codigo, orden
         FROM plantas
         ORDER BY orden ASC, nombre ASC`,
      );

      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Planta> {
    try {
      const result = await this.databaseService.query<PlantaRow>(
        `SELECT id, nombre, codigo, orden
         FROM plantas
         WHERE id = $1`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe una planta con id ${id}`);
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }

  async update(id: string, updatePlantaDto: UpdatePlantaDto): Promise<Planta> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updatePlantaDto.nombre !== undefined) {
      fields.push(`nombre = $${fields.length + 1}`);
      values.push(updatePlantaDto.nombre);
    }
    if (updatePlantaDto.codigo !== undefined) {
      fields.push(`codigo = $${fields.length + 1}`);
      values.push(updatePlantaDto.codigo);
    }
    if (updatePlantaDto.orden !== undefined) {
      fields.push(`orden = $${fields.length + 1}`);
      values.push(updatePlantaDto.orden);
    }

    if (!fields.length) {
      return this.findOne(id);
    }

    values.push(id);

    try {
      const result = await this.databaseService.query<PlantaRow>(
        `UPDATE plantas
         SET ${fields.join(', ')}
         WHERE id = $${values.length}
         RETURNING id, nombre, codigo, orden`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe una planta con id ${id}`);
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
        `DELETE FROM plantas
         WHERE id = $1
         RETURNING id`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe una planta con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }
}
