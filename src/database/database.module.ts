import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';

/**
 * Módulo de base de datos
 * Proporciona el servicio de conexión a PostgreSQL
 *
 * @Global - Hace que el servicio esté disponible en toda la aplicación
 * sin necesidad de importar el módulo en cada lugar
 */
@Global()
@Module({
  imports: [ConfigModule], // Importa ConfigModule para acceder a las variables de entorno
  providers: [DatabaseService],
  exports: [DatabaseService], // Exporta el servicio para que otros módulos puedan usarlo
})
export class DatabaseModule {}

// CREATE FUNCTION [esquema].[funcion]() RETURNS json
//     LANGUAGE plpgsql
// AS
// $$
// BEGIN
//     RETURN (SELECT JSON_AGG(ROW_TO_JSON(t))
//             FROM (SELECT [campos]
//                   FROM [esquema].[tabla] [alias]
//                   WHERE [condicion]) [alias];
// END;
// $$;
