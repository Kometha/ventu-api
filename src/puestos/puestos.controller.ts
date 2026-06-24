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
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { PuestosService } from './puestos.service';
import { Puesto } from './entities/puesto.entity';

@ApiTags('puestos')
@Controller('puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un puesto' })
  @ApiBody({ type: CreatePuestoDto })
  @ApiResponse({ status: 201, description: 'Puesto creado', type: Puesto })
  create(@Body() dto: CreatePuestoDto): Promise<Puesto> {
    return this.puestosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los puestos' })
  @ApiResponse({
    status: 200,
    description: 'Listado de puestos',
    type: [Puesto],
  })
  findAll(): Promise<Puesto[]> {
    return this.puestosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un puesto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del puesto' })
  @ApiResponse({ status: 200, description: 'Puesto encontrado', type: Puesto })
  findOne(@Param('id') id: string): Promise<Puesto> {
    return this.puestosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un puesto' })
  @ApiParam({ name: 'id', description: 'UUID del puesto' })
  @ApiBody({ type: UpdatePuestoDto })
  @ApiResponse({ status: 200, description: 'Puesto actualizado', type: Puesto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePuestoDto,
  ): Promise<Puesto> {
    return this.puestosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un puesto' })
  @ApiParam({ name: 'id', description: 'UUID del puesto' })
  @ApiResponse({ status: 204, description: 'Puesto eliminado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.puestosService.remove(id);
  }
}
