import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { BanksService } from './banks.service';
import { Bank } from './entities/bank.entity';

@ApiTags('banks')
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un banco' })
  @ApiBody({ type: CreateBankDto })
  @ApiResponse({ status: 201, description: 'Banco creado', type: Bank })
  create(@Body() dto: CreateBankDto): Promise<Bank> {
    return this.banksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los bancos' })
  @ApiResponse({ status: 200, description: 'Listado de bancos', type: [Bank] })
  findAll(): Promise<Bank[]> {
    return this.banksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un banco por ID' })
  @ApiParam({ name: 'id', description: 'ID del banco' })
  @ApiResponse({ status: 200, description: 'Banco encontrado', type: Bank })
  findOne(@Param('id') id: string): Promise<Bank> {
    return this.banksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un banco' })
  @ApiParam({ name: 'id', description: 'ID del banco' })
  @ApiBody({ type: UpdateBankDto })
  @ApiResponse({ status: 200, description: 'Banco actualizado', type: Bank })
  update(@Param('id') id: string, @Body() dto: UpdateBankDto): Promise<Bank> {
    return this.banksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un banco' })
  @ApiParam({ name: 'id', description: 'ID del banco' })
  @ApiResponse({ status: 204, description: 'Banco eliminado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.banksService.remove(id);
  }
}
