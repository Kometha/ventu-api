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
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { CategoriasService } from './categorias.service';

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una categoria' })
  @ApiBody({ type: CreateCategoriaDto })
  @ApiResponse({
    status: 201,
    description: 'Categoria creada correctamente',
    type: Categoria,
  })
  create(@Body() createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorias' })
  @ApiResponse({
    status: 200,
    description: 'Listado de categorias',
    type: [Categoria],
  })
  findAll(): Promise<Categoria[]> {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoria por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la categoria',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada',
    type: Categoria,
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Categoria> {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoria' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la categoria',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  @ApiBody({ type: UpdateCategoriaDto })
  @ApiResponse({
    status: 200,
    description: 'Categoria actualizada correctamente',
    type: Categoria,
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoria' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la categoria',
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
  })
  @ApiResponse({
    status: 204,
    description: 'Categoria eliminada correctamente',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriasService.remove(id);
  }
}
