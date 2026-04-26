/**
 * Configuración de variables de entorno
 *
 * Este archivo define las interfaces TypeScript para las variables de entorno
 * Ayuda a tener autocompletado y validación de tipos al usar ConfigService
 */

export interface EnvironmentVariables {
  // Configuración del servidor
  PORT: number;

  // Configuración de la base de datos PostgreSQL
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  // Configuración de conexión
  DB_MAX_CONNECTIONS?: number;
  DB_IDLE_TIMEOUT?: number;
  DB_CONNECTION_TIMEOUT?: number;
}
