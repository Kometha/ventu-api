import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SampleService } from './sample.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { Sample } from './entities/sample.entity';

/**
 * Controlador de Sample
 * Expone endpoints REST para operaciones CRUD sobre samples
 *
 */
@ApiTags('sample')
@Controller('sample')
export class SampleController {
  private readonly logger = new Logger(SampleController.name);

  constructor(private readonly sampleService: SampleService) {}

  /**
   * POST /sample
   * Crea un nuevo sample
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo sample' })
  @ApiBody({ type: CreateSampleDto })
  @ApiResponse({
    status: 201,
    description: 'El sample ha sido creado exitosamente',
    type: Sample,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  create(@Body() createSampleDto: CreateSampleDto): Sample {
    this.logger.log('POST /sample - Crear nuevo sample');
    return this.sampleService.create(createSampleDto);
  }

  /**
   * GET /sample
   * Obtiene todos los samples
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los samples' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los samples',
    type: [Sample],
  })
  findAll(): Sample[] {
    this.logger.log('GET /sample - Obtener todos los samples');
    return this.sampleService.findAll();
  }

  /**
   * GET /sample/:id
   * Obtiene un sample específico por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un sample por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del sample a buscar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'El sample encontrado',
    type: Sample,
  })
  @ApiResponse({
    status: 404,
    description: 'Sample no encontrado',
  })
  findOne(@Param('id') id: string): Sample {
    this.logger.log(`GET /sample/${id} - Obtener sample por ID`);
    return this.sampleService.findOne(id);
  }

  /**
   * PATCH /sample/:id
   * Actualiza parcialmente un sample existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un sample existente' })
  @ApiParam({
    name: 'id',
    description: 'ID del sample a actualizar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateSampleDto })
  @ApiResponse({
    status: 200,
    description: 'El sample ha sido actualizado exitosamente',
    type: Sample,
  })
  @ApiResponse({
    status: 404,
    description: 'Sample no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDto,
  ): Sample {
    this.logger.log(`PATCH /sample/${id} - Actualizar sample`);
    return this.sampleService.update(id, updateSampleDto);
  }

  /**
   * DELETE /sample/:id
   * Elimina un sample
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un sample' })
  @ApiParam({
    name: 'id',
    description: 'ID del sample a eliminar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'El sample ha sido eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Sample no encontrado',
  })
  remove(@Param('id') id: string): void {
    this.logger.log(`DELETE /sample/${id} - Eliminar sample`);
    this.sampleService.remove(id);
  }
}
