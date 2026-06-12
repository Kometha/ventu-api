import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service';
import { CreateLocatarioDto } from './dto/create-locatario.dto';
import { UpdateLocatarioDto } from './dto/update-locatario.dto';
import { ImagenLocatario, Locatario } from './entities/locatario.entity';

type LocatarioRow = {
  id: string;
  nombre_comercial: string;
  razon_social: string | null;
  categoria_id: string;
  rtn: string | null;
  telefono: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: Date;
};

type ImagenRow = {
  id: string;
  locatario_id: string;
  url: string;
  orden: number;
  es_portada: boolean;
  created_at: Date;
};


@Injectable()
export class LocatariosService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapImagen(row: ImagenRow): ImagenLocatario {
    return new ImagenLocatario({
      id: row.id,
      locatarioId: row.locatario_id,
      url: row.url,
      orden: row.orden,
      esPortada: row.es_portada,
      createdAt: new Date(row.created_at),
    });
  }

  private async getImagenesByLocatarioId(
    locatarioId: string,
    client?: PoolClient,
  ): Promise<ImagenLocatario[]> {
    const query = `SELECT id, locatario_id, url, orden, es_portada, created_at
                   FROM imagenes_locatarios
                   WHERE locatario_id = $1
                   ORDER BY es_portada DESC, orden ASC, created_at ASC`;
    const result = client
      ? await client.query<ImagenRow>(query, [locatarioId])
      : await this.databaseService.query<ImagenRow>(query, [locatarioId]);
    return result.rows.map((row) => this.mapImagen(row));
  }

  private async mapLocatarioWithImages(
    row: LocatarioRow,
    client?: PoolClient,
  ): Promise<Locatario> {
    const imagenes = await this.getImagenesByLocatarioId(row.id, client);

    return new Locatario({
      id: row.id,
      nombreComercial: row.nombre_comercial,
      razonSocial: row.razon_social,
      categoriaId: row.categoria_id,
      rtn: row.rtn,
      telefono: row.telefono,
      email: row.email,
      logoUrl: row.logo_url,
      createdAt: new Date(row.created_at),
      imagenes,
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException('El RTN ya existe para otro locatario.');
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'La categoria indicada no existe o no es valida.',
        );
      default:
        throw new InternalServerErrorException(
          `Ocurrio un error al procesar la operacion de locatarios. ${error?.message ?? ''}`.trim(),
        );
    }
  }

  async create(createLocatarioDto: CreateLocatarioDto): Promise<Locatario> {
    const client = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query<LocatarioRow>(
        `INSERT INTO locatarios (nombre_comercial, razon_social, categoria_id, rtn, telefono, email, logo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, nombre_comercial, razon_social, categoria_id, rtn, telefono, email, logo_url, created_at`,
        [
          createLocatarioDto.nombreComercial,
          createLocatarioDto.razonSocial,
          createLocatarioDto.rtn,
          createLocatarioDto.telefono,
          createLocatarioDto.email,
          createLocatarioDto.logoUrl,
        ],
      );


      await client.query('COMMIT');
      return this.mapLocatarioWithImages(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Locatario[]> {
    try {
      const result = await this.databaseService.query<LocatarioRow>(
        `SELECT id, nombre_comercial, razon_social, categoria_id, rtn, telefono, email, logo_url, created_at
         FROM locatarios
         ORDER BY created_at DESC`,
      );

      return Promise.all(result.rows.map((row) => this.mapLocatarioWithImages(row)));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Locatario> {
    try {
      const result = await this.databaseService.query<LocatarioRow>(
        `SELECT id, nombre_comercial, razon_social, categoria_id, rtn, telefono, email, logo_url, created_at
         FROM locatarios
         WHERE id = $1`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un locatario con id ${id}`);
      }

      return this.mapLocatarioWithImages(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async update(id: string, updateLocatarioDto: UpdateLocatarioDto): Promise<Locatario> {
    const client = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');

      const fields: string[] = [];
      const values: any[] = [];

      if (updateLocatarioDto.nombreComercial !== undefined) {
        fields.push(`nombre_comercial = $${fields.length + 1}`);
        values.push(updateLocatarioDto.nombreComercial);
      }
      if (updateLocatarioDto.razonSocial !== undefined) {
        fields.push(`razon_social = $${fields.length + 1}`);
        values.push(updateLocatarioDto.razonSocial);
      }
      if (updateLocatarioDto.rtn !== undefined) {
        fields.push(`rtn = $${fields.length + 1}`);
        values.push(updateLocatarioDto.rtn);
      }
      if (updateLocatarioDto.telefono !== undefined) {
        fields.push(`telefono = $${fields.length + 1}`);
        values.push(updateLocatarioDto.telefono);
      }
      if (updateLocatarioDto.email !== undefined) {
        fields.push(`email = $${fields.length + 1}`);
        values.push(updateLocatarioDto.email);
      }
      if (updateLocatarioDto.logoUrl !== undefined) {
        fields.push(`logo_url = $${fields.length + 1}`);
        values.push(updateLocatarioDto.logoUrl);
      }

      let locatarioRow: LocatarioRow | undefined;
      if (fields.length > 0) {
        values.push(id);
        const updateResult = await client.query<LocatarioRow>(
          `UPDATE locatarios
           SET ${fields.join(', ')}
           WHERE id = $${values.length}
           RETURNING id, nombre_comercial, razon_social, categoria_id, rtn, telefono, email, logo_url, created_at`,
          values,
        );
        locatarioRow = updateResult.rows[0];
      } else {
        const existing = await client.query<LocatarioRow>(
          `SELECT id, nombre_comercial, razon_social, categoria_id, rtn, telefono, email, logo_url, created_at
           FROM locatarios
           WHERE id = $1`,
          [id],
        );
        locatarioRow = existing.rows[0];
      }

      if (!locatarioRow) {
        throw new NotFoundException(`No existe un locatario con id ${id}`);
      }

      await client.query('COMMIT');
      return this.mapLocatarioWithImages(locatarioRow);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }

  async remove(id: string): Promise<void> {
    const client = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM imagenes_locatarios WHERE locatario_id = $1`, [id]);
      const result = await client.query<{ id: string }>(
        `DELETE FROM locatarios WHERE id = $1 RETURNING id`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un locatario con id ${id}`);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }
}
