import { BitacoraModule } from './bitacora/bitacora.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TicketsModule } from './tickets/tickets.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SampleModule } from './sample/sample.module';
import { DatabaseModule } from './database/database.module';
import { LocalesModule } from './locales/locales.module';
import { LocatariosModule } from './locatarios/locatarios.module';
import { UploadsModule } from './uploads/uploads.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PlantasModule } from './plantas/plantas.module';
import { EstadosContratoModule } from './estados-contrato/estados-contrato.module';
import { ContratosModule } from './contratos/contratos.module';
import { ArchivosContratosModule } from './archivos-contratos/archivos-contratos.module';
import { MapaModule } from './mapa/mapa.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { PuestosModule } from './puestos/puestos.module';
import { EmpleadosModule } from './empleados/empleados.module';

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
    LocalesModule, // Módulo CRUD de locales
    LocatariosModule, // Módulo CRUD de locatarios
    UploadsModule, // Módulo para subida de imágenes a Supabase Storage
    CategoriasModule, // Módulo CRUD de categorías
    PlantasModule, // Módulo CRUD de plantas
    EstadosContratoModule, // Módulo CRUD de estados de contrato
    ContratosModule, // Módulo CRUD de contratos de arrendamiento
    ArchivosContratosModule, // Módulo para archivos PDF de contratos
    MapaModule, // Módulo de vistas de ocupacion y mapa de locales
    DepartamentosModule, // RRHH: catálogo de departamentos
    PuestosModule, // RRHH: catálogo de puestos/cargos
    EmpleadosModule, // RRHH: mantenimiento de empleados
    AuthModule,
    UsuariosModule,
    TicketsModule,
    NotificacionesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
