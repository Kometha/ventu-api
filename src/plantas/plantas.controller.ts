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
import { CreatePlantaDto } from './dto/create-planta.dto';
import { UpdatePlantaDto } from './dto/update-planta.dto';
import { Planta } from './entities/planta.entity';
import { PlantasService } from './plantas.service';

@ApiTags('plantas')
@Controller('plantas')
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una planta' })
  @ApiBody({ type: CreatePlantaDto })
  @ApiResponse({
    status: 201,
    description: 'Planta creada correctamente',
    type: Planta,
  })
  create(@Body() createPlantaDto: CreatePlantaDto): Promise<Planta> {
    return this.plantasService.create(createPlantaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las plantas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de plantas',
    type: [Planta],
  })
  findAll(): Promise<Planta[]> {
    return this.plantasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una planta por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la planta',
    example: 'b98c4efd-df45-4b2f-a1d6-49a6ea0f8831',
  })
  @ApiResponse({
    status: 200,
    description: 'Planta encontrada',
    type: Planta,
  })
  @ApiResponse({
    status: 404,
    description: 'Planta no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Planta> {
    return this.plantasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una planta' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la planta',
    example: 'b98c4efd-df45-4b2f-a1d6-49a6ea0f8831',
  })
  @ApiBody({ type: UpdatePlantaDto })
  @ApiResponse({
    status: 200,
    description: 'Planta actualizada correctamente',
    type: Planta,
  })
  update(
    @Param('id') id: string,
    @Body() updatePlantaDto: UpdatePlantaDto,
  ): Promise<Planta> {
    return this.plantasService.update(id, updatePlantaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una planta' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la planta',
    example: 'b98c4efd-df45-4b2f-a1d6-49a6ea0f8831',
  })
  @ApiResponse({
    status: 204,
    description: 'Planta eliminada correctamente',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.plantasService.remove(id);
  }
}
