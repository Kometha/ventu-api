import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';

/**
 * Módulo Sample
 */
@Module({
  controllers: [SampleController], // Controladores del módulo
  providers: [SampleService], // Servicios y providers del módulo
  exports: [SampleService], // Exporta el servicio para que pueda ser usado en otros módulos
})
export class SampleModule {}
