import { Module } from '@nestjs/common';
import { ArchivosContratosController } from './archivos-contratos.controller';
import { ArchivosContratosService } from './archivos-contratos.service';

@Module({
  controllers: [ArchivosContratosController],
  providers: [ArchivosContratosService],
})
export class ArchivosContratosModule {}
