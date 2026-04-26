import { BitacoraModule } from './bitacora/bitacora.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SampleModule } from './sample/sample.module';
import { DatabaseModule } from './database/database.module';

/**
 * Módulo raíz de la aplicación
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible en toda la app
      envFilePath: ['.env.local', '.env'], // Prioriza .env.local y usa .env como fallback
    }),
    DatabaseModule, // Módulo de conexión a PostgreSQL (Global)
    SampleModule, // Módulo de ejemplo con operaciones CRUD
    BitacoraModule, // Módulo de bitácora
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
