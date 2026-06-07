/**
 * Configuración de variables de entorno
 */

export interface EnvironmentVariables {
  PORT: number;

  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  DB_SSL?: string;
  DB_SSL_REJECT_UNAUTHORIZED?: string;

  DB_MAX_CONNECTIONS?: number;
  DB_IDLE_TIMEOUT?: number;
  DB_CONNECTION_TIMEOUT?: number;

  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_STORAGE_BUCKET?: string;

  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
}
