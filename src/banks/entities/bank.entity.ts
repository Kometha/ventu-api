import { ApiProperty } from '@nestjs/swagger';

export class Bank {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'BAC', description: 'Código único del banco' })
  code: string;

  @ApiProperty({ example: 'BAMCPADP', nullable: true })
  swiftCode?: string | null;

  @ApiProperty({ example: 'Banco de América Central' })
  name: string;

  @ApiProperty({ example: 'BAC', nullable: true })
  shortName?: string | null;

  @ApiProperty({ example: 'PA', nullable: true })
  countryCode?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: '1', nullable: true })
  createdBy?: string | null;

  @ApiProperty({ example: '1', nullable: true })
  updatedBy?: string | null;

  constructor(partial: Partial<Bank>) {
    Object.assign(this, partial);
  }
}
