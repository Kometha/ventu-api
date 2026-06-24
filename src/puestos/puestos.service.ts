import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { Puesto } from './entities/puesto.entity';

type PuestoRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  departamento_id: string;
  departamento_nombre: string | null;
  salario_minimo: string | null;
  salario_maximo: string | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
};

const SELECT_PUESTO = `SELECT p.id, p.nombre, p.descripcion, p.departamento_id,
                              d.nombre AS departamento_nombre,
                              p.salario_minimo, p.salario_maximo, p.activo,
                              p.created_at, p.updated_at
                       FROM puestos p
                       LEFT JOIN departamentos d ON d.id = p.departamento_id`;

@Injectable()
export class PuestosService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToEntity(row: PuestoRow): Puesto {
    return new Puesto({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      departamentoId: row.departamento_id,
      departamentoNombre: row.departamento_nombre,
      salarioMinimo:
        row.salario_minimo !== null ? parseFloat(row.salario_minimo) : null,
      salarioMaximo:
        row.salario_maximo !== null ? parseFloat(row.salario_maximo) : null,
      activo: row.activo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe un puesto con ese nombre en el departamento.',
        );
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'El departamento indicado no existe, o el puesto tiene empleados asociados.',
        );
      case '23514':
        throw new BadRequestException(
          'Datos invalidos: revise el rango salarial (maximo debe ser mayor o igual al minimo).',
        );
      default:
        throw new InternalServerErrorException(
          'Ocurrio un error al procesar la operacion de puestos.',
        );
    }
  }

  async create(dto: CreatePuestoDto): Promise<Puesto> {
    try {
      const inserted = await this.databaseService.query<{ id: string }>(
        `INSERT INTO puestos (nombre, descripcion, departamento_id, salario_minimo, salario_maximo, activo)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE))
         RETURNING id`,
        [
          dto.nombre,
          dto.descripcion ?? null,
          dto.departamentoId,
          dto.salarioMinimo ?? null,
          dto.salarioMaximo ?? null,
          dto.activo ?? null,
        ],
      );
      return this.findOne(inserted.rows[0].id);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Puesto[]> {
    try {
      const result = await this.databaseService.query<PuestoRow>(
        `${SELECT_PUESTO} ORDER BY d.nombre ASC, p.nombre ASC`,
      );
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Puesto> {
    try {
      const result = await this.databaseService.query<PuestoRow>(
        `${SELECT_PUESTO} WHERE p.id = $1`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un puesto con id ${id}`);
      }
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async update(id: string, dto: UpdatePuestoDto): Promise<Puesto> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      const push = (column: string, value: any) => {
        fields.push(`${column} = $${fields.length + 1}`);
        values.push(value);
      };

      if (dto.nombre !== undefined) push('nombre', dto.nombre);
      if (dto.descripcion !== undefined) push('descripcion', dto.descripcion);
      if (dto.departamentoId !== undefined)
        push('departamento_id', dto.departamentoId);
      if (dto.salarioMinimo !== undefined)
        push('salario_minimo', dto.salarioMinimo);
      if (dto.salarioMaximo !== undefined)
        push('salario_maximo', dto.salarioMaximo);
      if (dto.activo !== undefined) push('activo', dto.activo);

      if (!fields.length) {
        return this.findOne(id);
      }

      values.push(id);
      const result = await this.databaseService.query<{ id: string }>(
        `UPDATE puestos SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un puesto con id ${id}`);
      }
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.databaseService.query<{ id: string }>(
        `DELETE FROM puestos WHERE id = $1 RETURNING id`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un puesto con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }
}
