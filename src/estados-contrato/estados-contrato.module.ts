import { Module } from '@nestjs/common';
import { EstadosContratoController } from './estados-contrato.controller';
import { EstadosContratoService } from './estados-contrato.service';

@Module({
  controllers: [EstadosContratoController],
  providers: [EstadosContratoService],
  exports: [EstadosContratoService],
})
export class EstadosContratoModule {}
