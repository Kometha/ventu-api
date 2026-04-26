import { PartialType } from '@nestjs/swagger';
import { CreateLocatarioDto } from './create-locatario.dto';

export class UpdateLocatarioDto extends PartialType(CreateLocatarioDto) {}
