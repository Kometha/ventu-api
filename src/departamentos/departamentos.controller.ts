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
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { DepartamentosService } from './departamentos.service';
import { Departamento } from './entities/departamento.entity';

@ApiTags('departamentos')
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un departamento' })
  @ApiBody({ type: CreateDepartamentoDto })
  @ApiResponse({
    status: 201,
    description: 'Departamento creado',
    type: Departamento,
  })
  create(@Body() dto: CreateDepartamentoDto): Promise<Departamento> {
    return this.departamentosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  @ApiResponse({
    status: 200,
    description: 'Listado de departamentos',
    type: [Departamento],
  })
  findAll(): Promise<Departamento[]> {
    return this.departamentosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un departamento por ID' })
  @ApiParam({ name: 'id', description: 'UUID del departamento' })
  @ApiResponse({
    status: 200,
    description: 'Departamento encontrado',
    type: Departamento,
  })
  findOne(@Param('id') id: string): Promise<Departamento> {
    return this.departamentosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un departamento' })
  @ApiParam({ name: 'id', description: 'UUID del departamento' })
  @ApiBody({ type: UpdateDepartamentoDto })
  @ApiResponse({
    status: 200,
    description: 'Departamento actualizado',
    type: Departamento,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartamentoDto,
  ): Promise<Departamento> {
    return this.departamentosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un departamento' })
  @ApiParam({ name: 'id', description: 'UUID del departamento' })
  @ApiResponse({ status: 204, description: 'Departamento eliminado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.departamentosService.remove(id);
  }
}
