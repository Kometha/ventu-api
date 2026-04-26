import { Module } from '@nestjs/common';
import { LocatariosController } from './locatarios.controller';
import { LocatariosService } from './locatarios.service';

@Module({
  controllers: [LocatariosController],
  providers: [LocatariosService],
  exports: [LocatariosService],
})
export class LocatariosModule {}
