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
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { EmpleadosService } from './empleados.service';
import {
  Empleado,
  EmpleadoAuditoria,
  EmpleadoDocumento,
} from './entities/empleado.entity';

@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un empleado con documentos opcionales' })
  @ApiBody({ type: CreateEmpleadoDto })
  @ApiResponse({ status: 201, description: 'Empleado creado', type: Empleado })
  create(@Body() dto: CreateEmpleadoDto): Promise<Empleado> {
    return this.empleadosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener empleados (con filtros opcionales)' })
  @ApiQuery({ name: 'estado', required: false, example: 'activo' })
  @ApiQuery({ name: 'departamentoId', required: false })
  @ApiQuery({ name: 'puestoId', required: false })
  @ApiQuery({
    name: 'buscar',
    required: false,
    description: 'Nombre, apellido, código o identidad',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de empleados',
    type: [Empleado],
  })
  findAll(
    @Query('estado') estado?: string,
    @Query('departamentoId') departamentoId?: string,
    @Query('puestoId') puestoId?: string,
    @Query('buscar') buscar?: string,
  ): Promise<Empleado[]> {
    return this.empleadosService.findAll({
      estado,
      departamentoId,
      puestoId,
      buscar,
    });
  }

  @Get('auditoria')
  @ApiOperation({ summary: 'Historial de auditoria de empleados' })
  @ApiQuery({
    name: 'empleadoId',
    required: false,
    description: 'Filtra por empleado',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de auditoria',
    type: [EmpleadoAuditoria],
  })
  findAuditoria(
    @Query('empleadoId') empleadoId?: string,
  ): Promise<EmpleadoAuditoria[]> {
    return this.empleadosService.findAuditoria(empleadoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiResponse({
    status: 200,
    description: 'Empleado encontrado',
    type: Empleado,
  })
  findOne(@Param('id') id: string): Promise<Empleado> {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiBody({ type: UpdateEmpleadoDto })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado',
    type: Empleado,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmpleadoDto,
  ): Promise<Empleado> {
    return this.empleadosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiResponse({ status: 204, description: 'Empleado eliminado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.empleadosService.remove(id);
  }

  // ----------------- Documentos -----------------

  @Get(':id/documentos')
  @ApiOperation({ summary: 'Listar documentos de un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiResponse({
    status: 200,
    description: 'Documentos del empleado',
    type: [EmpleadoDocumento],
  })
  findDocumentos(@Param('id') id: string): Promise<EmpleadoDocumento[]> {
    return this.empleadosService.findDocumentos(id);
  }

  @Post(':id/documentos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar un documento a un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiBody({ type: CreateDocumentoDto })
  @ApiResponse({
    status: 201,
    description: 'Documento agregado',
    type: EmpleadoDocumento,
  })
  addDocumento(
    @Param('id') id: string,
    @Body() dto: CreateDocumentoDto,
  ): Promise<EmpleadoDocumento> {
    return this.empleadosService.addDocumento(id, dto);
  }

  @Delete(':id/documentos/:documentoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un documento de un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiParam({ name: 'documentoId', description: 'UUID del documento' })
  @ApiResponse({ status: 204, description: 'Documento eliminado' })
  removeDocumento(
    @Param('id') id: string,
    @Param('documentoId') documentoId: string,
  ): Promise<void> {
    return this.empleadosService.removeDocumento(id, documentoId);
  }
}
