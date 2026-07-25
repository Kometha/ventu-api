import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';

type BankRow = {
  id: string;
  code: string;
  swift_code: string | null;
  name: string;
  short_name: string | null;
  country_code: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
};

const SELECT_BANK = `SELECT id, code, swift_code, name, short_name, country_code,
                            is_active, created_at, updated_at, created_by, updated_by
                     FROM banks`;

@Injectable()
export class BanksService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToEntity(row: BankRow): Bank {
    return new Bank({
      id: row.id,
      code: row.code,
      swiftCode: row.swift_code,
      name: row.name,
      shortName: row.short_name,
      countryCode: row.country_code,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'Ya existe un banco con ese código o nombre.',
        );
      case '22P02':
        throw new BadRequestException('El ID no tiene un formato válido.');
      case '23503':
        throw new BadRequestException(
          'Referencia inválida o el banco tiene registros asociados.',
        );
      default:
        throw new InternalServerErrorException(
          'Ocurrió un error al procesar la operación de bancos.',
        );
    }
  }

  async create(dto: CreateBankDto): Promise<Bank> {
    try {
      const inserted = await this.databaseService.query<{ id: string }>(
        `INSERT INTO banks (code, swift_code, name, short_name, country_code, is_active, created_by)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE), $7)
         RETURNING id`,
        [
          dto.code,
          dto.swiftCode ?? null,
          dto.name,
          dto.shortName ?? null,
          dto.countryCode ?? null,
          dto.isActive ?? null,
          dto.createdBy ?? null,
        ],
      );
      return this.findOne(inserted.rows[0].id);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Bank[]> {
    try {
      const result = await this.databaseService.query<BankRow>(
        `${SELECT_BANK} ORDER BY name ASC`,
      );
      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Bank> {
    try {
      const result = await this.databaseService.query<BankRow>(
        `${SELECT_BANK} WHERE id = $1`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un banco con id ${id}`);
      }
      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async update(id: string, dto: UpdateBankDto): Promise<Bank> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      const push = (column: string, value: any) => {
        fields.push(`${column} = $${fields.length + 1}`);
        values.push(value);
      };

      if (dto.code !== undefined) push('code', dto.code);
      if (dto.swiftCode !== undefined) push('swift_code', dto.swiftCode);
      if (dto.name !== undefined) push('name', dto.name);
      if (dto.shortName !== undefined) push('short_name', dto.shortName);
      if (dto.countryCode !== undefined) push('country_code', dto.countryCode);
      if (dto.isActive !== undefined) push('is_active', dto.isActive);
      if (dto.updatedBy !== undefined) push('updated_by', dto.updatedBy);

      if (!fields.length) {
        return this.findOne(id);
      }

      // Mantiene actualizado el timestamp en cada modificación.
      fields.push('updated_at = CURRENT_TIMESTAMP');

      values.push(id);
      const result = await this.databaseService.query<{ id: string }>(
        `UPDATE banks SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un banco con id ${id}`);
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
        `DELETE FROM banks WHERE id = $1 RETURNING id`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un banco con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }
}
