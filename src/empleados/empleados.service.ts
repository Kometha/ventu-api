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
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import {
  Empleado,
  EmpleadoAuditoria,
  EmpleadoDocumento,
} from './entities/empleado.entity';

type EmpleadoRow = {
  id: string;
  codigo_empleado: string;
  nombres: string;
  apellidos: string;
  identidad: string;
  rtn: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  estado_civil: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  foto_url: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  departamento_id: string;
  departamento_nombre: string | null;
  puesto_id: string;
  puesto_nombre: string | null;
  jefe_id: string | null;
  jefe_nombre: string | null;
  fecha_ingreso: string;
  fecha_salida: string | null;
  tipo_contrato: string;
  estado: string;
  salario_base: string;
  moneda: string;
  banco: string | null;
  numero_cuenta: string | null;
  created_at: Date;
  updated_at: Date;
};

type DocumentoRow = {
  id: string;
  empleado_id: string;
  tipo: string;
  nombre: string;
  url: string;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  created_at: Date;
};

export interface FindEmpleadosFiltros {
  estado?: string;
  departamentoId?: string;
  puestoId?: string;
  buscar?: string;
}

const SELECT_EMPLEADO = `SELECT e.id, e.codigo_empleado, e.nombres, e.apellidos, e.identidad, e.rtn,
                                e.fecha_nacimiento, e.genero, e.estado_civil, e.telefono, e.email,
                                e.direccion, e.foto_url, e.contacto_emergencia_nombre, e.contacto_emergencia_telefono,
                                e.departamento_id, d.nombre AS departamento_nombre,
                                e.puesto_id, p.nombre AS puesto_nombre,
                                e.jefe_id, (j.nombres || ' ' || j.apellidos) AS jefe_nombre,
                                e.fecha_ingreso, e.fecha_salida, e.tipo_contrato, e.estado,
                                e.salario_base, e.moneda, e.banco, e.numero_cuenta,
                                e.created_at, e.updated_at
                         FROM empleados e
                         LEFT JOIN departamentos d ON d.id = e.departamento_id
                         LEFT JOIN puestos p       ON p.id = e.puesto_id
                         LEFT JOIN empleados j     ON j.id = e.jefe_id`;

@Injectable()
export class EmpleadosService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapDocumento(row: DocumentoRow): EmpleadoDocumento {
    return new EmpleadoDocumento({
      id: row.id,
      empleadoId: row.empleado_id,
      tipo: row.tipo,
      nombre: row.nombre,
      url: row.url,
      fechaEmision: row.fecha_emision,
      fechaVencimiento: row.fecha_vencimiento,
      createdAt: new Date(row.created_at),
    });
  }

  private async getDocumentosByEmpleadoId(
    empleadoId: string,
    client?: PoolClient,
  ): Promise<EmpleadoDocumento[]> {
    const query = `SELECT id, empleado_id, tipo, nombre, url, fecha_emision, fecha_vencimiento, created_at
                   FROM empleados_documentos
                   WHERE empleado_id = $1
                   ORDER BY created_at ASC`;
    const result = client
      ? await client.query<DocumentoRow>(query, [empleadoId])
      : await this.databaseService.query<DocumentoRow>(query, [empleadoId]);
    return result.rows.map((row) => this.mapDocumento(row));
  }

  private async mapEmpleado(
    row: EmpleadoRow,
    client?: PoolClient,
  ): Promise<Empleado> {
    const documentos = await this.getDocumentosByEmpleadoId(row.id, client);
    return new Empleado({
      id: row.id,
      codigoEmpleado: row.codigo_empleado,
      nombres: row.nombres,
      apellidos: row.apellidos,
      identidad: row.identidad,
      rtn: row.rtn,
      fechaNacimiento: row.fecha_nacimiento,
      genero: row.genero,
      estadoCivil: row.estado_civil,
      telefono: row.telefono,
      email: row.email,
      direccion: row.direccion,
      fotoUrl: row.foto_url,
      contactoEmergenciaNombre: row.contacto_emergencia_nombre,
      contactoEmergenciaTelefono: row.contacto_emergencia_telefono,
      departamentoId: row.departamento_id,
      departamentoNombre: row.departamento_nombre,
      puestoId: row.puesto_id,
      puestoNombre: row.puesto_nombre,
      jefeId: row.jefe_id,
      jefeNombre: row.jefe_nombre,
      fechaIngreso: row.fecha_ingreso,
      fechaSalida: row.fecha_salida,
      tipoContrato: row.tipo_contrato,
      estado: row.estado,
      salarioBase: parseFloat(row.salario_base),
      moneda: row.moneda.trim(),
      banco: row.banco,
      numeroCuenta: row.numero_cuenta,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      documentos,
    });
  }

  private handleDbError(error: any): never {
    switch (error?.code) {
      case '23505':
        throw new ConflictException(
          'El codigo de empleado o la identidad ya existen para otro empleado.',
        );
      case '22P02':
        throw new BadRequestException('El ID no tiene formato UUID valido.');
      case '23503':
        throw new BadRequestException(
          'El departamento, puesto o jefe indicado no existe.',
        );
      case '23502':
        throw new BadRequestException(
          'Faltan campos requeridos en la operacion.',
        );
      case '23514':
        throw new BadRequestException(
          'Datos invalidos: revise estado, tipo de contrato, genero, fechas o salario.',
        );
      default:
        throw new InternalServerErrorException(
          `Ocurrio un error al procesar la operacion de empleados. ${error?.message ?? ''}`.trim(),
        );
    }
  }

  async create(dto: CreateEmpleadoDto): Promise<Empleado> {
    const client = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');

      const inserted = await client.query<{ id: string }>(
        `INSERT INTO empleados (
            codigo_empleado, nombres, apellidos, identidad, rtn, fecha_nacimiento,
            genero, estado_civil, telefono, email, direccion, foto_url,
            contacto_emergencia_nombre, contacto_emergencia_telefono,
            departamento_id, puesto_id, jefe_id, fecha_ingreso, fecha_salida,
            tipo_contrato, estado, salario_base, moneda, banco, numero_cuenta)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
                 COALESCE($20,'permanente'), COALESCE($21,'activo'), COALESCE($22,0),
                 COALESCE($23,'L'), $24, $25)
         RETURNING id`,
        [
          dto.codigoEmpleado,
          dto.nombres,
          dto.apellidos,
          dto.identidad,
          dto.rtn ?? null,
          dto.fechaNacimiento ?? null,
          dto.genero ?? null,
          dto.estadoCivil ?? null,
          dto.telefono ?? null,
          dto.email ?? null,
          dto.direccion ?? null,
          dto.fotoUrl ?? null,
          dto.contactoEmergenciaNombre ?? null,
          dto.contactoEmergenciaTelefono ?? null,
          dto.departamentoId,
          dto.puestoId,
          dto.jefeId ?? null,
          dto.fechaIngreso,
          dto.fechaSalida ?? null,
          dto.tipoContrato ?? null,
          dto.estado ?? null,
          dto.salarioBase ?? null,
          dto.moneda ?? null,
          dto.banco ?? null,
          dto.numeroCuenta ?? null,
        ],
      );

      const empleadoId = inserted.rows[0].id;

      if (dto.documentos?.length) {
        for (const doc of dto.documentos) {
          await client.query(
            `INSERT INTO empleados_documentos (empleado_id, tipo, nombre, url, fecha_emision, fecha_vencimiento)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              empleadoId,
              doc.tipo,
              doc.nombre,
              doc.url,
              doc.fechaEmision ?? null,
              doc.fechaVencimiento ?? null,
            ],
          );
        }
      }

      const result = await client.query<EmpleadoRow>(
        `${SELECT_EMPLEADO} WHERE e.id = $1`,
        [empleadoId],
      );

      await client.query('COMMIT');
      return this.mapEmpleado(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof HttpException) throw error;
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }

  async findAll(filtros: FindEmpleadosFiltros = {}): Promise<Empleado[]> {
    try {
      const conditions: string[] = [];
      const values: any[] = [];

      if (filtros.estado) {
        values.push(filtros.estado);
        conditions.push(`e.estado = $${values.length}`);
      }
      if (filtros.departamentoId) {
        values.push(filtros.departamentoId);
        conditions.push(`e.departamento_id = $${values.length}`);
      }
      if (filtros.puestoId) {
        values.push(filtros.puestoId);
        conditions.push(`e.puesto_id = $${values.length}`);
      }
      if (filtros.buscar) {
        values.push(`%${filtros.buscar}%`);
        const idx = values.length;
        conditions.push(
          `(e.nombres ILIKE $${idx} OR e.apellidos ILIKE $${idx} OR e.codigo_empleado ILIKE $${idx} OR e.identidad ILIKE $${idx})`,
        );
      }

      const where = conditions.length
        ? ` WHERE ${conditions.join(' AND ')}`
        : '';
      const result = await this.databaseService.query<EmpleadoRow>(
        `${SELECT_EMPLEADO}${where} ORDER BY e.apellidos ASC, e.nombres ASC`,
        values,
      );

      return Promise.all(result.rows.map((row) => this.mapEmpleado(row)));
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findOne(id: string): Promise<Empleado> {
    try {
      const result = await this.databaseService.query<EmpleadoRow>(
        `${SELECT_EMPLEADO} WHERE e.id = $1`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un empleado con id ${id}`);
      }
      return this.mapEmpleado(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async update(id: string, dto: UpdateEmpleadoDto): Promise<Empleado> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      const push = (column: string, value: any) => {
        fields.push(`${column} = $${fields.length + 1}`);
        values.push(value);
      };

      if (dto.codigoEmpleado !== undefined)
        push('codigo_empleado', dto.codigoEmpleado);
      if (dto.nombres !== undefined) push('nombres', dto.nombres);
      if (dto.apellidos !== undefined) push('apellidos', dto.apellidos);
      if (dto.identidad !== undefined) push('identidad', dto.identidad);
      if (dto.rtn !== undefined) push('rtn', dto.rtn);
      if (dto.fechaNacimiento !== undefined)
        push('fecha_nacimiento', dto.fechaNacimiento);
      if (dto.genero !== undefined) push('genero', dto.genero);
      if (dto.estadoCivil !== undefined) push('estado_civil', dto.estadoCivil);
      if (dto.telefono !== undefined) push('telefono', dto.telefono);
      if (dto.email !== undefined) push('email', dto.email);
      if (dto.direccion !== undefined) push('direccion', dto.direccion);
      if (dto.fotoUrl !== undefined) push('foto_url', dto.fotoUrl);
      if (dto.contactoEmergenciaNombre !== undefined)
        push('contacto_emergencia_nombre', dto.contactoEmergenciaNombre);
      if (dto.contactoEmergenciaTelefono !== undefined)
        push('contacto_emergencia_telefono', dto.contactoEmergenciaTelefono);
      if (dto.departamentoId !== undefined)
        push('departamento_id', dto.departamentoId);
      if (dto.puestoId !== undefined) push('puesto_id', dto.puestoId);
      if (dto.jefeId !== undefined) push('jefe_id', dto.jefeId);
      if (dto.fechaIngreso !== undefined)
        push('fecha_ingreso', dto.fechaIngreso);
      if (dto.fechaSalida !== undefined) push('fecha_salida', dto.fechaSalida);
      if (dto.tipoContrato !== undefined)
        push('tipo_contrato', dto.tipoContrato);
      if (dto.estado !== undefined) push('estado', dto.estado);
      if (dto.salarioBase !== undefined) push('salario_base', dto.salarioBase);
      if (dto.moneda !== undefined) push('moneda', dto.moneda);
      if (dto.banco !== undefined) push('banco', dto.banco);
      if (dto.numeroCuenta !== undefined)
        push('numero_cuenta', dto.numeroCuenta);

      if (!fields.length) {
        return this.findOne(id);
      }

      values.push(id);
      const result = await this.databaseService.query<{ id: string }>(
        `UPDATE empleados SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id`,
        values,
      );

      if (!result.rows.length) {
        throw new NotFoundException(`No existe un empleado con id ${id}`);
      }
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // empleados_documentos se elimina en cascada por la FK ON DELETE CASCADE
      const result = await this.databaseService.query<{ id: string }>(
        `DELETE FROM empleados WHERE id = $1 RETURNING id`,
        [id],
      );
      if (!result.rows.length) {
        throw new NotFoundException(`No existe un empleado con id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  // ----------------- Documentos del empleado -----------------

  async findDocumentos(empleadoId: string): Promise<EmpleadoDocumento[]> {
    await this.findOne(empleadoId); // valida existencia
    return this.getDocumentosByEmpleadoId(empleadoId);
  }

  async addDocumento(
    empleadoId: string,
    dto: CreateDocumentoDto,
  ): Promise<EmpleadoDocumento> {
    try {
      const result = await this.databaseService.query<DocumentoRow>(
        `INSERT INTO empleados_documentos (empleado_id, tipo, nombre, url, fecha_emision, fecha_vencimiento)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, empleado_id, tipo, nombre, url, fecha_emision, fecha_vencimiento, created_at`,
        [
          empleadoId,
          dto.tipo,
          dto.nombre,
          dto.url,
          dto.fechaEmision ?? null,
          dto.fechaVencimiento ?? null,
        ],
      );
      return this.mapDocumento(result.rows[0]);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async removeDocumento(
    empleadoId: string,
    documentoId: string,
  ): Promise<void> {
    try {
      const result = await this.databaseService.query<{ id: string }>(
        `DELETE FROM empleados_documentos WHERE id = $1 AND empleado_id = $2 RETURNING id`,
        [documentoId, empleadoId],
      );
      if (!result.rows.length) {
        throw new NotFoundException(
          `No existe el documento ${documentoId} para el empleado ${empleadoId}`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error);
    }
  }

  // ----------------- Auditoria -----------------

  async findAuditoria(empleadoId?: string): Promise<EmpleadoAuditoria[]> {
    try {
      const values: any[] = [];
      let where = '';
      if (empleadoId) {
        values.push(empleadoId);
        where = ` WHERE empleado_id = $1`;
      }
      const result = await this.databaseService.query<{
        id: string;
        empleado_id: string | null;
        operacion: string;
        datos_anteriores: Record<string, any> | null;
        datos_nuevos: Record<string, any> | null;
        usuario_db: string | null;
        fecha: Date;
      }>(
        `SELECT id, empleado_id, operacion, datos_anteriores, datos_nuevos, usuario_db, fecha
         FROM empleados_auditoria${where}
         ORDER BY fecha DESC`,
        values,
      );

      return result.rows.map(
        (row) =>
          new EmpleadoAuditoria({
            id: row.id,
            empleadoId: row.empleado_id,
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
