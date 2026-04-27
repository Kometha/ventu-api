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

type LocalLookupRow = {
  id: string;
  categoria_id: string;
  planta_id: string;
  area_m2: string | number;
};

type ContratoRow = {
  id: string;
  local_id: string;
  estado_contrato_id: string;
  fecha_inicio: string | Date;
  fecha_fin: string | Date;
  renta_base: string | number;
  moneda: string;
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
          'El estado de contrato o local indicado no existe.',
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
        `INSERT INTO locatarios (nombre_comercial, razon_social, rtn, telefono, email, logo_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nombre_comercial, razon_social, rtn, telefono, email, logo_url, created_at`,
        [
          createLocatarioDto.nombreComercial,
          createLocatarioDto.razonSocial ?? null,
          createLocatarioDto.rtn ?? null,
          createLocatarioDto.telefono ?? null,
          createLocatarioDto.email ?? null,
          createLocatarioDto.logoUrl ?? null,
        ],
      );

      const locatario = result.rows[0];

      const localResult = await client.query<LocalLookupRow>(
        `SELECT id, categoria_id, planta_id, area_m2
         FROM locales
         WHERE id = $1`,
        [createLocatarioDto.localId],
      );

      if (!localResult.rows.length) {
        throw new BadRequestException('No existe un local con el localId enviado.');
      }

      const local = localResult.rows[0];
      if (
        createLocatarioDto.categoriaId &&
        local.categoria_id !== createLocatarioDto.categoriaId
      ) {
        throw new BadRequestException(
          'La categoria seleccionada no coincide con el local seleccionado.',
        );
      }
      if (createLocatarioDto.plantaId && local.planta_id !== createLocatarioDto.plantaId) {
        throw new BadRequestException(
          'La planta seleccionada no coincide con el local seleccionado.',
        );
      }

      if (createLocatarioDto.areaM2 !== undefined) {
        const localArea = Number(local.area_m2);
        const payloadArea = Number(createLocatarioDto.areaM2);
        if (Math.abs(localArea - payloadArea) > 0.01) {
          throw new BadRequestException(
            'El area_m2 no coincide con el area configurada en el local.',
          );
        }
      }

      if (
        createLocatarioDto.codigoLocal &&
        createLocatarioDto.codigoLocal.trim().length > 0
      ) {
        const codigoResult = await client.query<{ codigo_local: string }>(
          `SELECT codigo_local FROM locales WHERE id = $1`,
          [local.id],
        );
        const codigoLocalDb = codigoResult.rows[0]?.codigo_local;
        if (codigoLocalDb !== createLocatarioDto.codigoLocal) {
          throw new BadRequestException(
            'El codigoLocal no coincide con el local seleccionado.',
          );
        }
      }

      if (new Date(createLocatarioDto.finContrato) < new Date(createLocatarioDto.inicioContrato)) {
        throw new BadRequestException(
          'finContrato no puede ser menor a inicioContrato.',
        );
      }

      if (createLocatarioDto.imagenes?.length) {
        for (const imagen of createLocatarioDto.imagenes) {
          await client.query(
            `INSERT INTO imagenes_locatarios (locatario_id, url, orden, es_portada)
             VALUES ($1, $2, $3, $4)`,
            [locatario.id, imagen.url, imagen.orden ?? 0, imagen.esPortada ?? false],
          );
        }
      }

      const contratoResult = await client.query<ContratoRow>(
        `INSERT INTO contratos (local_id, locatario_id, estado_contrato_id, fecha_inicio, fecha_fin, renta_base, moneda)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, local_id, estado_contrato_id, fecha_inicio, fecha_fin, renta_base, moneda`,
        [
          local.id,
          locatario.id,
          createLocatarioDto.estadoContratoId,
          createLocatarioDto.inicioContrato,
          createLocatarioDto.finContrato,
          createLocatarioDto.rentaMensual,
          createLocatarioDto.moneda ?? 'L',
        ],
      );

      await client.query('COMMIT');
      const mapped = await this.mapLocatarioWithImages(locatario);
      const contrato = contratoResult.rows[0];
      mapped.contratoActual = {
        id: contrato.id,
        localId: contrato.local_id,
        estadoContratoId: contrato.estado_contrato_id,
        fechaInicio: new Date(contrato.fecha_inicio).toISOString().slice(0, 10),
        fechaFin: new Date(contrato.fecha_fin).toISOString().slice(0, 10),
        rentaBase: Number(contrato.renta_base),
        moneda: contrato.moneda,
      };
      return mapped;
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
        `SELECT id, nombre_comercial, razon_social, rtn, telefono, email, logo_url, created_at
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
        `SELECT id, nombre_comercial, razon_social, rtn, telefono, email, logo_url, created_at
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
           RETURNING id, nombre_comercial, razon_social, rtn, telefono, email, logo_url, created_at`,
          values,
        );
        locatarioRow = updateResult.rows[0];
      } else {
        const existing = await client.query<LocatarioRow>(
          `SELECT id, nombre_comercial, razon_social, rtn, telefono, email, logo_url, created_at
           FROM locatarios
           WHERE id = $1`,
          [id],
        );
        locatarioRow = existing.rows[0];
      }

      if (!locatarioRow) {
        throw new NotFoundException(`No existe un locatario con id ${id}`);
      }

      if (updateLocatarioDto.imagenes !== undefined) {
        await client.query(`DELETE FROM imagenes_locatarios WHERE locatario_id = $1`, [id]);
        for (const imagen of updateLocatarioDto.imagenes) {
          await client.query(
            `INSERT INTO imagenes_locatarios (locatario_id, url, orden, es_portada)
             VALUES ($1, $2, $3, $4)`,
            [id, imagen.url, imagen.orden ?? 0, imagen.esPortada ?? false],
          );
        }
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
