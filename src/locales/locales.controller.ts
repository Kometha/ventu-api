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
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { Local } from './entities/local.entity';
import { LocalesService } from './locales.service';

@ApiTags('locales')
@Controller('locales')
export class LocalesController {
  constructor(private readonly localesService: LocalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un local' })
  @ApiBody({ type: CreateLocalDto })
  @ApiResponse({
    status: 201,
    description: 'Local creado correctamente',
    type: Local,
  })
  create(@Body() createLocalDto: CreateLocalDto): Promise<Local> {
    return this.localesService.create(createLocalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los locales' })
  @ApiResponse({
    status: 200,
    description: 'Listado de locales',
    type: [Local],
  })
  findAll(): Promise<Local[]> {
    return this.localesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un local por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del local',
    example: 'f1494139-f5ff-4b69-a237-34a0be53af44',
  })
  @ApiResponse({
    status: 200,
    description: 'Local encontrado',
    type: Local,
  })
  @ApiResponse({
    status: 404,
    description: 'Local no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Local> {
    return this.localesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un local' })
  @ApiParam({
    name: 'id',
    description: 'UUID del local',
    example: 'f1494139-f5ff-4b69-a237-34a0be53af44',
  })
  @ApiBody({ type: UpdateLocalDto })
  @ApiResponse({
    status: 200,
    description: 'Local actualizado correctamente',
    type: Local,
  })
  update(
    @Param('id') id: string,
    @Body() updateLocalDto: UpdateLocalDto,
  ): Promise<Local> {
    return this.localesService.update(id, updateLocalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un local' })
  @ApiParam({
    name: 'id',
    description: 'UUID del local',
    example: 'f1494139-f5ff-4b69-a237-34a0be53af44',
  })
  @ApiResponse({
    status: 204,
    description: 'Local eliminado correctamente',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.localesService.remove(id);
  }
}
