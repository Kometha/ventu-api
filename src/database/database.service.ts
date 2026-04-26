import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Servicio de base de datos PostgreSQL
 * Maneja el pool de conexiones a la base de datos
 * Proporciona métodos para ejecutar queries y funciones
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  /**
   * Inicializa el pool de conexiones cuando el módulo se carga
   */
  async onModuleInit() {
    this.logger.log('Inicializando conexión a PostgreSQL...');

    // Configurar el pool de conexiones usando las variables de entorno
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      max: this.configService.get<number>('DB_MAX_CONNECTIONS', 10),
      idleTimeoutMillis: this.configService.get<number>(
        'DB_IDLE_TIMEOUT',
        30000,
      ),
      connectionTimeoutMillis: this.configService.get<number>(
        'DB_CONNECTION_TIMEOUT',
        2000,
      ),
    });

    // Verificar la conexión (no bloquea el inicio de la aplicación)
    try {
      const client = await this.pool.connect();
      this.logger.log('✅ Conexión a PostgreSQL establecida exitosamente');
      client.release();
    } catch (error) {
      this.logger.error('❌ Error al conectar a PostgreSQL:');
      this.logger.error(error.message);
      this.logger.warn(
        '⚠️ La aplicación iniciará sin conexión a la base de datos',
      );
      this.logger.warn('Verifica las credenciales en el archivo .env');
      // No lanzamos el error para que la app pueda iniciar igual
    }
  }

  /**
   * Cierra el pool de conexiones cuando el módulo se destruye
   */
  async onModuleDestroy() {
    this.logger.log('Cerrando conexión a PostgreSQL...');
    await this.pool.end();
  }

  /**
   * Obtiene un cliente del pool de conexiones
   * @returns Cliente de PostgreSQL
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Ejecuta una query SQL
   * @param query - Query SQL a ejecutar
   * @param params - Parámetros de la query
   * @returns Resultado de la query
   */
  async query<T extends QueryResultRow = any>(
    query: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const client = await this.getClient();
    try {
      this.logger.debug(`Ejecutando query: ${query}`);
      const result = await client.query<T>(query, params);
      return result;
    } catch (error) {
      this.logger.error(`Error ejecutando query: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Ejecuta una función de PostgreSQL
   * @param functionName - Nombre de la función (puede incluir el esquema, ej: 'facturacion.ft_obtiene_formas_pago')
   * @param params - Parámetros de la función
   * @returns Resultado de la función (desanidado automáticamente)
   */
  async executeFunction<T extends QueryResultRow = any>(
    functionName: string,
    params: any[] = [],
  ): Promise<T[]> {
    // Construir los placeholders para los parámetros ($1, $2, etc.)
    const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');

    // Construir la query para llamar a la función
    const query = `SELECT * FROM ${functionName}(${placeholders})`;

    this.logger.debug(`Llamando función: ${functionName}(${placeholders})`);

    try {
      const result = await this.query<T>(query, params);
      const rows = result.rows;

      // Desanidar el resultado si viene dentro de un objeto con el nombre de la función
      // Ejemplo: [{ft_obtener_bitacora: [...]}] -> [...]
      if (rows.length > 0 && rows[0]) {
        const firstRow = rows[0];
        const keys = Object.keys(firstRow);

        // Si la primera fila tiene solo una key y es un array u objeto
        if (keys.length === 1) {
          const key = keys[0];
          const value = firstRow[key];

          // Si el valor es un array, devolverlo directamente
          if (Array.isArray(value)) {
            return value as T[];
          }

          // Si el valor es un objeto, intentar extraer el contenido
          if (typeof value === 'object' && value !== null) {
            // Si tiene una propiedad que coincide con el nombre de la función
            const functionBaseName = functionName.split('.').pop();
            if (functionBaseName && value[functionBaseName]) {
              return Array.isArray(value[functionBaseName])
                ? value[functionBaseName]
                : [value[functionBaseName]];
            }
          }
        }
      }

      // Si no se pudo desanidar, devolver las filas tal como están
      return rows;
    } catch (error) {
      this.logger.error(
        `Error ejecutando función ${functionName}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtiene el pool de conexiones (para casos avanzados)
   * @returns Pool de PostgreSQL
   */
  getPool(): Pool {
    return this.pool;
  }
}

