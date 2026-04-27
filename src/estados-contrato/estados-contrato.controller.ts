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
import { CreateEstadoContratoDto } from './dto/create-estado-contrato.dto';
import { UpdateEstadoContratoDto } from './dto/update-estado-contrato.dto';
import { EstadoContrato } from './entities/estado-contrato.entity';
import { EstadosContratoService } from './estados-contrato.service';

@ApiTags('estados-contrato')
@Controller('estados-contrato')
export class EstadosContratoController {
  constructor(
    private readonly estadosContratoService: EstadosContratoService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un estado de contrato' })
  @ApiBody({ type: CreateEstadoContratoDto })
  @ApiResponse({
    status: 201,
    description: 'Estado de contrato creado correctamente',
    type: EstadoContrato,
  })
  create(
    @Body() createEstadoContratoDto: CreateEstadoContratoDto,
  ): Promise<EstadoContrato> {
    return this.estadosContratoService.create(createEstadoContratoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estados de contrato' })
  @ApiResponse({
    status: 200,
    description: 'Listado de estados de contrato',
    type: [EstadoContrato],
  })
  findAll(): Promise<EstadoContrato[]> {
    return this.estadosContratoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estado de contrato por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del estado de contrato',
    example: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de contrato encontrado',
    type: EstadoContrato,
  })
  @ApiResponse({
    status: 404,
    description: 'Estado de contrato no encontrado',
  })
  findOne(@Param('id') id: string): Promise<EstadoContrato> {
    return this.estadosContratoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estado de contrato' })
  @ApiParam({
    name: 'id',
    description: 'UUID del estado de contrato',
    example: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
  })
  @ApiBody({ type: UpdateEstadoContratoDto })
  @ApiResponse({
    status: 200,
    description: 'Estado de contrato actualizado correctamente',
    type: EstadoContrato,
  })
  update(
    @Param('id') id: string,
    @Body() updateEstadoContratoDto: UpdateEstadoContratoDto,
  ): Promise<EstadoContrato> {
    return this.estadosContratoService.update(id, updateEstadoContratoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un estado de contrato' })
  @ApiParam({
    name: 'id',
    description: 'UUID del estado de contrato',
    example: '0f05954b-cd42-48b5-af62-5bcc7d359d29',
  })
  @ApiResponse({
    status: 204,
    description: 'Estado de contrato eliminado correctamente',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.estadosContratoService.remove(id);
  }
}
