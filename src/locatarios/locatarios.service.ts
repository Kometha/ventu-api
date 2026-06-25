import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PoolClient } from 'pg';
import { normalizeMoneda } from '../common/utils/moneda.util';
import { DatabaseService } from '../database/database.service';
import { CreateLocatarioDto } from './dto/create-locatario.dto';
import { UpdateLocatarioDto } from './dto/update-locatario.dto';
import { ContratoResumen, EstadoContrato, ImagenLocatario, LocalResumen, Locatario, LocatarioAuditoria } from './entities/locatario.entity';

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

type ContratoRow = {
  id: string;
  renta_base: string;
  moneda: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_contrato_id: string;
  estado_nombre: string;
  estado_descripcion: string | null;
  local_id: string | null;
  local_nombre: string | null;
  local_codigo: string | null;
  local_area_m2: string | null;
  local_descripcion: string | null;
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

  private async getContratoYLocalByLocatarioId(
    locatarioId: string,
    client?: PoolClient,
  ): Promise<{ contrato: ContratoResumen | null; local: LocalResumen | null }> {
    const query = `SELECT c.id, c.renta_base, c.moneda, c.fecha_inicio, c.fecha_fin,
                          ec.id   AS estado_contrato_id,
                          ec.nombre AS estado_nombre,
                          ec.descripcion AS estado_descripcion,
                          l.id    AS local_id,
                          l.nombre AS local_nombre,
                          l.codigo_local AS local_codigo,
                          l.area_m2 AS local_area_m2,
                          l.descripcion AS local_descripcion
                   FROM contratos c
                   LEFT JOIN estados_contrato ec ON ec.id = c.estado_contrato_id
                   LEFT JOIN locales l ON l.id = c.local_id
                   WHERE c.locatario_id = $1
                   ORDER BY c.fecha_inicio DESC
                   LIMIT 1`;
    const result = client
      ? await client.query<ContratoRow>(query, [locatarioId])
      : await this.databaseService.query<ContratoRow>(query, [locatarioId]);

    if (!result.rows.length) return { contrato: null, local: null };
    const row = result.rows[0];

    const estadoContrato = row.estado_contrato_id
      ? new EstadoContrato({
          id: row.estado_contrato_id,
          nombre: row.estado_nombre,
          descripcion: row.estado_descripcion,
        })
      : null;

    const contrato = new ContratoResumen({
      id: row.id,
      rentaBase: parseFloat(row.renta_base),
      moneda: row.moneda.trim(),
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin,
      estadoContrato,
    });

    const local = row.local_id
      ? new LocalResumen({
          id: row.local_id,
          nombre: row.local_nombre!,
          codigoLocal: row.local_codigo!,
          areaM2: parseFloat(row.local_area_m2!),
          descripcion: row.local_descripcion,
        })
      : null;

    return { contrato, local };
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
    const [imagenes, { contrato, local }] = await Promise.all([
      this.getImagenesByLocatarioId(row.id, client),
      this.getContratoYLocalByLocatarioId(row.id, client),
    ]);

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
      local,
      contrato,
      imagenes,
    });
  }

  private readonly ESTADO_VENCIDO_ID = '92e91fa5-b9fd-4690-ac93-9b3eb9ebdf3c';

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException('El RTN ya existe para otro locatario.');
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'La categoria o el local indicado no existe o no es valido.',
        );
      case '23502':
        throw new BadRequestException(
          'Faltan campos requeridos en la operacion.',
        );
      default:
        throw new InternalServerErrorException(
          `Ocurrio un error al procesar la operacion de locatarios. ${error?.message ?? ''}`.trim(),
        );
    }
  }

  private async getContratoActivoId(
    locatarioId: string,
    client: PoolClient,
  ): Promise<{ id: string; estadoContratoId: string } | null> {
    const result = await client.query<{ id: string; estado_contrato_id: string }>(
      `SELECT id, estado_contrato_id FROM contratos WHERE locatario_id = $1 ORDER BY fecha_inicio DESC LIMIT 1`,
      [locatarioId],
    );
    if (!result.rows.length) return null;
    return { id: result.rows[0].id, estadoContratoId: result.rows[0].estado_contrato_id };
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
          createLocatarioDto.razonSocial ?? null,
          createLocatarioDto.categoriaId,
          createLocatarioDto.rtn ?? null,
          createLocatarioDto.telefono ?? null,
          createLocatarioDto.email ?? null,
          createLocatarioDto.logoUrl ?? null,
        ],
      );

      const locatarioId = result.rows[0].id;

      if (createLocatarioDto.contrato) {
        const c = createLocatarioDto.contrato;
        await client.query(
          `INSERT INTO contratos (locatario_id, local_id, estado_contrato_id, fecha_inicio, fecha_fin, renta_base, moneda)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            locatarioId,
            c.localId ?? null,
            c.estadoContratoId,
            c.fechaInicio,
            c.fechaFin,
            c.rentaBase,
            normalizeMoneda(c.moneda),
          ],
        );
      }

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
      if (updateLocatarioDto.categoriaId !== undefined) {
        fields.push(`categoria_id = $${fields.length + 1}`);
        values.push(updateLocatarioDto.categoriaId);
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

      if (updateLocatarioDto.contrato) {
        const contratoActual = await this.getContratoActivoId(id, client);

        if (contratoActual && contratoActual.estadoContratoId !== this.ESTADO_VENCIDO_ID) {
          throw new BadRequestException(
            'Solo se puede registrar un nuevo contrato si el contrato actual se encuentra en estado Vencido.',
          );
        }

        const c = updateLocatarioDto.contrato;
        await client.query(
          `INSERT INTO contratos (locatario_id, local_id, estado_contrato_id, fecha_inicio, fecha_fin, renta_base, moneda)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id,
            c.localId ?? null,
            c.estadoContratoId,
            c.fechaInicio,
            c.fechaFin,
            c.rentaBase,
            normalizeMoneda(c.moneda),
          ],
        );
      }

      await client.query('COMMIT');
      return this.mapLocatarioWithImages(locatarioRow);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof HttpException) throw error;
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }

  async remove(id: string): Promise<void> {
    const client = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');

      const contratoActual = await this.getContratoActivoId(id, client);
      if (contratoActual && contratoActual.estadoContratoId !== this.ESTADO_VENCIDO_ID) {
        throw new BadRequestException(
          'No se puede eliminar el locatario porque tiene un contrato activo. El contrato debe estar en estado Vencido para poder eliminarlo.',
        );
      }

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
      if (error instanceof HttpException) throw error;
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }

  async findAuditoria(): Promise<LocatarioAuditoria[]> {
    try {
      const result = await this.databaseService.query<{
        id: string;
        locatario_id: string | null;
        operacion: string;
        datos_anteriores: Record<string, any> | null;
        datos_nuevos: Record<string, any> | null;
        usuario_db: string | null;
        fecha: Date;
      }>(`SELECT id, locatario_id, operacion, datos_anteriores, datos_nuevos, usuario_db, fecha
          FROM locatarios_auditoria
          ORDER BY fecha DESC`);

      return result.rows.map(
        (row) =>
          new LocatarioAuditoria({
            id: row.id,
            locatarioId: row.locatario_id,
            operacion: row.operacion,
            datosAnteriores: row.datos_anteriores,
            datosNuevos: row.datos_nuevos,
            usuarioDb: row.usuario_db,
            fecha: new Date(row.fecha),
          }),
      );
    } catch (error) {
      this.handleDbError(error);
    }
  }
}
