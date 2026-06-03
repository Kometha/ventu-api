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
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';
import { ContratosResumen } from './entities/contratos-resumen.entity';

@ApiTags('contratos')
@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un contrato de arrendamiento' })
  @ApiBody({ type: CreateContratoDto })
  @ApiResponse({
    status: 201,
    description: 'Contrato creado con relaciones embebidas',
    type: Contrato,
  })
  create(@Body() createContratoDto: CreateContratoDto): Promise<Contrato> {
    return this.contratosService.create(createContratoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los contratos de arrendamiento' })
  @ApiResponse({
    status: 200,
    description: 'Listado de contratos con local, locatario y estado embebidos',
    type: [Contrato],
  })
  findAll(): Promise<Contrato[]> {
    return this.contratosService.findAll();
  }

  @Get('resumen')
  @ApiOperation({
    summary: 'Resumen de contratos por estado',
    description:
      'Cuenta los contratos agrupados por cada estado del catalogo (activos, por vencer, en renegociacion, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Totales por estado de contrato',
    type: ContratosResumen,
  })
  getResumen(): Promise<ContratosResumen> {
    return this.contratosService.getResumen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contrato por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del contrato',
    example: 'c8f3a2b1-4d5e-6f70-8192-a3b4c5d6e7f8',
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato encontrado',
    type: Contrato,
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Contrato> {
    return this.contratosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un contrato de arrendamiento' })
  @ApiParam({
    name: 'id',
    description: 'UUID del contrato',
    example: 'c8f3a2b1-4d5e-6f70-8192-a3b4c5d6e7f8',
  })
  @ApiBody({ type: UpdateContratoDto })
  @ApiResponse({
    status: 200,
    description: 'Contrato actualizado',
    type: Contrato,
  })
  update(
    @Param('id') id: string,
    @Body() updateContratoDto: UpdateContratoDto,
  ): Promise<Contrato> {
    return this.contratosService.update(id, updateContratoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un contrato de arrendamiento' })
  @ApiParam({
    name: 'id',
    description: 'UUID del contrato',
    example: 'c8f3a2b1-4d5e-6f70-8192-a3b4c5d6e7f8',
  })
  @ApiResponse({
    status: 204,
    description: 'Contrato eliminado correctamente',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.contratosService.remove(id);
  }
}
