import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';

type CategoriaRow = {
  id: string;
  nombre: string;
  icono: string | null;
  created_at: Date;
};

@Injectable()
export class CategoriasService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToEntity(row: CategoriaRow): Categoria {
    return new Categoria({
      id: row.id,
      nombre: row.nombre,
      icono: row.icono,
      createdAt: new Date(row.created_at),
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe una categoria con ese nombre.',
        );
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'No se puede eliminar la categoria porque esta siendo utilizada por otros registros.',
        );
      default:
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de categorias.',
        );
    }
  }

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    try {
      const result = await this.databaseService.query<CategoriaRow>(
        `INSERT INTO categorias (nombre, icono)
         VALUES ($1, $2)
         RETURNING id, nombre, icono, created_at`,
        [createCategoriaDto.nombre, createCategoriaDto.icono ?? null],
      );

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Categoria[]> {
    try {
      const result = await this.databaseService.query<CategoriaRow>(
        `SELECT id, nombre, icono, created_at
         FROM categorias
         ORDER BY nombre ASC`,
      );

      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Categoria> {
    try {
      const result = await this.databaseService.query<CategoriaRow>(
        `SELECT id, nombre, icono, created_at
         FROM categorias
         WHERE id = $1`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe una categoria con id ${id}`);
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
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updateCategoriaDto.nombre !== undefined) {
      fields.push(`nombre = $${fields.length + 1}`);
      values.push(updateCategoriaDto.nombre);
    }
    if (updateCategoriaDto.icono !== undefined) {
      fields.push(`icono = $${fields.length + 1}`);
      values.push(updateCategoriaDto.icono);
    }

    if (!fields.length) {
      return this.findOne(id);
    }

    values.push(id);

    try {
      const result = await this.databaseService.query<CategoriaRow>(
        `UPDATE categorias
         SET ${fields.join(', ')}
         WHERE id = $${values.length}
         RETURNING id, nombre, icono, created_at`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe una categoria con id ${id}`);
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
        `DELETE FROM categorias
         WHERE id = $1
         RETURNING id`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe una categoria con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDbError(error);
    }
  }
}
