import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { CreateBankDto } from './create-bank.dto';

export class UpdateBankDto extends PartialType(
  OmitType(CreateBankDto, ['createdBy'] as const),
) {
  @ApiProperty({
    description: 'ID del usuario que actualiza el registro',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'updatedBy debe ser un ID numérico' })
  updatedBy?: string;
}
