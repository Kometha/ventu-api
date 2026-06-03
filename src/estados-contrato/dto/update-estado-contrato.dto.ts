import { PartialType } from '@nestjs/swagger';
import { CreateEstadoContratoDto } from './create-estado-contrato.dto';

export class UpdateEstadoContratoDto extends PartialType(CreateEstadoContratoDto) {}
