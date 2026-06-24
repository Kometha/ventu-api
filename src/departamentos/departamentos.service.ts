import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { Departamento } from './entities/departamento.entity';

type DepartamentoRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class DepartamentosService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToEntity(row: DepartamentoRow): Departamento {
    return new Departamento({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      activo: row.activo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe un departamento con ese nombre.',
        );
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'No se puede eliminar el departamento porque tiene puestos o empleados asociados.',
        );
      default:
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de departamentos.',
        );
    }
  }

  async create(dto: CreateDepartamentoDto): Promise<Departamento> {
    try {
      const result = await this.databaseService.query<DepartamentoRow>(
        `INSERT INTO departamentos (nombre, descripcion, activo)
         VALUES ($1, $2, COALESCE($3, TRUE))
         RETURNING id, nombre, descripcion, activo, created_at, updated_at`,
        [dto.nombre, dto.descripcion ?? null, dto.activo ?? null],
      );
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Departamento[]> {
    try {
      const result = await this.databaseService.query<DepartamentoRow>(
        `SELECT id, nombre, descripcion, activo, created_at, updated_at
         FROM departamentos
         ORDER BY nombre ASC`,
      );
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Departamento> {
    try {
      const result = await this.databaseService.query<DepartamentoRow>(
        `SELECT id, nombre, descripcion, activo, created_at, updated_at
         FROM departamentos
         WHERE id = $1`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un departamento con id ${id}`);
      }
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async update(id: string, dto: UpdateDepartamentoDto): Promise<Departamento> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (dto.nombre !== undefined) {
        fields.push(`nombre = $${fields.length + 1}`);
        values.push(dto.nombre);
      }
      if (dto.descripcion !== undefined) {
        fields.push(`descripcion = $${fields.length + 1}`);
        values.push(dto.descripcion);
      }
      if (dto.activo !== undefined) {
        fields.push(`activo = $${fields.length + 1}`);
        values.push(dto.activo);
      }

      if (!fields.length) {
        return this.findOne(id);
      }

      values.push(id);
      const result = await this.databaseService.query<DepartamentoRow>(
        `UPDATE departamentos
         SET ${fields.join(', ')}
         WHERE id = $${values.length}
         RETURNING id, nombre, descripcion, activo, created_at, updated_at`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un departamento con id ${id}`);
      }
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.databaseService.query<{ id: string }>(
        `DELETE FROM departamentos WHERE id = $1 RETURNING id`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un departamento con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }
}
