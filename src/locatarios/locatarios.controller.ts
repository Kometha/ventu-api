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
import { CreateLocatarioDto } from './dto/create-locatario.dto';
import { UpdateLocatarioDto } from './dto/update-locatario.dto';
import { Locatario } from './entities/locatario.entity';
import { LocatariosService } from './locatarios.service';

@ApiTags('locatarios')
@Controller('locatarios')
export class LocatariosController {
  constructor(private readonly locatariosService: LocatariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un locatario con imagenes opcionales' })
  @ApiBody({ type: CreateLocatarioDto })
  @ApiResponse({
    status: 201,
    description: 'Locatario creado correctamente',
    type: Locatario,
  })
  create(@Body() createLocatarioDto: CreateLocatarioDto): Promise<Locatario> {
    return this.locatariosService.create(createLocatarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los locatarios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de locatarios',
    type: [Locatario],
  })
  findAll(): Promise<Locatario[]> {
    return this.locatariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un locatario por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del locatario',
    example: 'ff8482e8-1cc7-4e92-a073-bf2080142752',
  })
  @ApiResponse({
    status: 200,
    description: 'Locatario encontrado',
    type: Locatario,
  })
  findOne(@Param('id') id: string): Promise<Locatario> {
    return this.locatariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un locatario (imagenes opcionales)' })
  @ApiParam({
    name: 'id',
    description: 'UUID del locatario',
    example: 'ff8482e8-1cc7-4e92-a073-bf2080142752',
  })
  @ApiBody({ type: UpdateLocatarioDto })
  @ApiResponse({
    status: 200,
    description: 'Locatario actualizado correctamente',
    type: Locatario,
  })
  update(
    @Param('id') id: string,
    @Body() updateLocatarioDto: UpdateLocatarioDto,
  ): Promise<Locatario> {
    return this.locatariosService.update(id, updateLocatarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un locatario' })
  @ApiParam({
    name: 'id',
    description: 'UUID del locatario',
    example: 'ff8482e8-1cc7-4e92-a073-bf2080142752',
  })
  @ApiResponse({
    status: 204,
    description: 'Locatario eliminado correctamente',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.locatariosService.remove(id);
  }
}
