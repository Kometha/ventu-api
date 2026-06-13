import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateArchivoContratoDto } from './dto/create-archivo-contrato.dto';
import { ArchivoContrato } from './entities/archivo-contrato.entity';

type ArchivoContratoRow = {
  id: string;
  filename: string;
  url: string;
  created_at: Date;
};

@Injectable()
export class ArchivosContratosService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: ArchivoContratoRow): ArchivoContrato {
    return new ArchivoContrato({
      id: row.id,
      filename: row.filename,
      url: row.url,
      createdAt: new Date(row.created_at),
    });
  }

  async create(dto: CreateArchivoContratoDto): Promise<ArchivoContrato> {
    try {
      const result = await this.databaseService.query<ArchivoContratoRow>(
        `INSERT INTO archivos_contratos (filename, url)
         VALUES ($1, $2)
         RETURNING id, filename, url, created_at`,
        [dto.filename, dto.url],
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al guardar el archivo: ${error?.message ?? ''}`.trim(),
      );
    }
  }

  async findAll(): Promise<ArchivoContrato[]> {
    try {
      const result = await this.databaseService.query<ArchivoContratoRow>(
        `SELECT id, filename, url, created_at
         FROM archivos_contratos
         ORDER BY created_at DESC`,
      );
      return result.rows.map((row) => this.mapRow(row));
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los archivos: ${error?.message ?? ''}`.trim(),
      );
    }
  }
}
