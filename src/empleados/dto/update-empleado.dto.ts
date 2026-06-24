import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './create-empleado.dto';

// Los documentos se administran con sus propios endpoints; en el update
// del empleado solo se modifican los datos del registro principal.
export class UpdateEmpleadoDto extends PartialType(
  OmitType(CreateEmpleadoDto, ['documentos'] as const),
) {}
