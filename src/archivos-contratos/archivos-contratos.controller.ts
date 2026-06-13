import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArchivosContratosService } from './archivos-contratos.service';
import { CreateArchivoContratoDto } from './dto/create-archivo-contrato.dto';
import { ArchivoContrato } from './entities/archivo-contrato.entity';

@ApiTags('archivos-contratos')
@Controller('archivos-contratos')
export class ArchivosContratosController {
  constructor(private readonly archivosContratosService: ArchivosContratosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un archivo PDF de contrato' })
  @ApiBody({ type: CreateArchivoContratoDto })
  @ApiResponse({ status: 201, description: 'Archivo registrado correctamente', type: ArchivoContrato })
  create(@Body() dto: CreateArchivoContratoDto): Promise<ArchivoContrato> {
    return this.archivosContratosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los archivos de contratos' })
  @ApiResponse({ status: 200, description: 'Listado de archivos', type: [ArchivoContrato] })
  findAll(): Promise<ArchivoContrato[]> {
    return this.archivosContratosService.findAll();
  }
}
