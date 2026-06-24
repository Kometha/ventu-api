import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum Genero {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  OTRO = 'otro',
}

export enum EstadoCivil {
  SOLTERO = 'soltero',
  CASADO = 'casado',
  UNION_LIBRE = 'union_libre',
  DIVORCIADO = 'divorciado',
  VIUDO = 'viudo',
}

export enum TipoContrato {
  PERMANENTE = 'permanente',
  TEMPORAL = 'temporal',
  POR_HORAS = 'por_horas',
  SERVICIOS_PROFESIONALES = 'servicios_profesionales',
  PRACTICANTE = 'practicante',
}

export enum EstadoEmpleado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
  VACACIONES = 'vacaciones',
  DESPEDIDO = 'despedido',
}

export enum TipoDocumento {
  CONTRATO = 'contrato',
  IDENTIDAD = 'identidad',
  RTN = 'rtn',
  CURRICULUM = 'curriculum',
  TITULO = 'titulo',
  CERTIFICACION = 'certificacion',
  CONSTANCIA = 'constancia',
  OTRO = 'otro',
}

export class CreateEmpleadoDocumentoDto {
  @ApiProperty({ enum: TipoDocumento, example: TipoDocumento.CONTRATO })
  @IsEnum(TipoDocumento, { message: 'tipo de documento no valido' })
  tipo: TipoDocumento;

  @ApiProperty({ example: 'Contrato laboral 2026', maxLength: 150 })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombre del documento es requerido' })
  @MaxLength(150, { message: 'nombre no puede exceder 150 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'https://cdn.miapp.com/empleados/contrato-001.pdf' })
  @IsString({ message: 'url debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'url es requerida' })
  url: string;

  @ApiProperty({ example: '2026-01-15', required: false })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fechaEmision debe ser una fecha valida (YYYY-MM-DD)' },
  )
  fechaEmision?: string;

  @ApiProperty({ example: '2027-01-15', required: false })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fechaVencimiento debe ser una fecha valida (YYYY-MM-DD)' },
  )
  fechaVencimiento?: string;
}

export class CreateEmpleadoDto {
  @ApiProperty({
    description: 'Código único del empleado',
    example: 'EMP-0001',
    maxLength: 20,
  })
  @IsString({ message: 'codigoEmpleado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'codigoEmpleado es requerido' })
  @MaxLength(20, { message: 'codigoEmpleado no puede exceder 20 caracteres' })
  codigoEmpleado: string;

  @ApiProperty({ example: 'Juan Carlos', maxLength: 80 })
  @IsString({ message: 'nombres debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'nombres es requerido' })
  @MaxLength(80, { message: 'nombres no puede exceder 80 caracteres' })
  nombres: string;

  @ApiProperty({ example: 'Pérez López', maxLength: 80 })
  @IsString({ message: 'apellidos debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'apellidos es requerido' })
  @MaxLength(80, { message: 'apellidos no puede exceder 80 caracteres' })
  apellidos: string;

  @ApiProperty({
    description: 'Documento nacional de identidad',
    example: '0801199912345',
    maxLength: 20,
  })
  @IsString({ message: 'identidad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'identidad es requerido' })
  @MaxLength(20, { message: 'identidad no puede exceder 20 caracteres' })
  identidad: string;

  @ApiProperty({ example: '08011999123960', required: false, maxLength: 20 })
  @IsOptional()
  @IsString({ message: 'rtn debe ser una cadena de texto' })
  @MaxLength(20, { message: 'rtn no puede exceder 20 caracteres' })
  rtn?: string;

  @ApiProperty({ example: '1999-01-15', required: false })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fechaNacimiento debe ser una fecha valida (YYYY-MM-DD)' },
  )
  fechaNacimiento?: string;

  @ApiProperty({ enum: Genero, example: Genero.MASCULINO, required: false })
  @IsOptional()
  @IsEnum(Genero, { message: 'genero no valido' })
  genero?: Genero;

  @ApiProperty({
    enum: EstadoCivil,
    example: EstadoCivil.SOLTERO,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoCivil, { message: 'estadoCivil no valido' })
  estadoCivil?: EstadoCivil;

  @ApiProperty({ example: '+504 9999-8888', required: false, maxLength: 30 })
  @IsOptional()
  @IsString({ message: 'telefono debe ser una cadena de texto' })
  @MaxLength(30, { message: 'telefono no puede exceder 30 caracteres' })
  telefono?: string;

  @ApiProperty({
    example: 'juan.perez@empresa.com',
    required: false,
    maxLength: 120,
  })
  @IsOptional()
  @IsEmail({}, { message: 'email no tiene un formato valido' })
  @MaxLength(120, { message: 'email no puede exceder 120 caracteres' })
  email?: string;

  @ApiProperty({
    example: 'Col. Kennedy, Tegucigalpa',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'direccion debe ser una cadena de texto' })
  @MaxLength(255, { message: 'direccion no puede exceder 255 caracteres' })
  direccion?: string;

  @ApiProperty({
    example: 'https://cdn.miapp.com/empleados/foto-001.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'fotoUrl debe ser una cadena de texto' })
  fotoUrl?: string;

  @ApiProperty({ example: 'María Pérez', required: false, maxLength: 120 })
  @IsOptional()
  @IsString({
    message: 'contactoEmergenciaNombre debe ser una cadena de texto',
  })
  @MaxLength(120, {
    message: 'contactoEmergenciaNombre no puede exceder 120 caracteres',
  })
  contactoEmergenciaNombre?: string;

  @ApiProperty({ example: '+504 9999-7777', required: false, maxLength: 30 })
  @IsOptional()
  @IsString({
    message: 'contactoEmergenciaTelefono debe ser una cadena de texto',
  })
  @MaxLength(30, {
    message: 'contactoEmergenciaTelefono no puede exceder 30 caracteres',
  })
  contactoEmergenciaTelefono?: string;

  @ApiProperty({ description: 'ID del departamento', example: 'd1d2d3d4-...' })
  @IsNotEmpty({ message: 'departamentoId es requerido' })
  @IsUUID('4', { message: 'departamentoId debe ser un UUID valido' })
  departamentoId: string;

  @ApiProperty({ description: 'ID del puesto', example: 'p1p2p3p4-...' })
  @IsNotEmpty({ message: 'puestoId es requerido' })
  @IsUUID('4', { message: 'puestoId debe ser un UUID valido' })
  puestoId: string;

  @ApiProperty({
    description: 'ID del jefe directo (opcional)',
    example: 'j1j2j3j4-...',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'jefeId debe ser un UUID valido' })
  jefeId?: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString(
    {},
    { message: 'fechaIngreso debe ser una fecha valida (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'fechaIngreso es requerido' })
  fechaIngreso: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fechaSalida debe ser una fecha valida (YYYY-MM-DD)' },
  )
  fechaSalida?: string;

  @ApiProperty({
    enum: TipoContrato,
    example: TipoContrato.PERMANENTE,
    required: false,
  })
  @IsOptional()
  @IsEnum(TipoContrato, { message: 'tipoContrato no valido' })
  tipoContrato?: TipoContrato;

  @ApiProperty({
    enum: EstadoEmpleado,
    example: EstadoEmpleado.ACTIVO,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoEmpleado, { message: 'estado no valido' })
  estado?: EstadoEmpleado;

  @ApiProperty({ example: 25000.0, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'salarioBase debe ser un numero' })
  @Min(0, { message: 'salarioBase no puede ser negativo' })
  salarioBase?: number;

  @ApiProperty({ example: 'L', required: false, maxLength: 3 })
  @IsOptional()
  @IsString({ message: 'moneda debe ser una cadena de texto' })
  @MaxLength(3, { message: 'moneda no puede exceder 3 caracteres' })
  moneda?: string;

  @ApiProperty({ example: 'Banco Atlántida', required: false, maxLength: 80 })
  @IsOptional()
  @IsString({ message: 'banco debe ser una cadena de texto' })
  @MaxLength(80, { message: 'banco no puede exceder 80 caracteres' })
  banco?: string;

  @ApiProperty({ example: '01010123456789', required: false, maxLength: 40 })
  @IsOptional()
  @IsString({ message: 'numeroCuenta debe ser una cadena de texto' })
  @MaxLength(40, { message: 'numeroCuenta no puede exceder 40 caracteres' })
  numeroCuenta?: string;

  @ApiProperty({ type: () => [CreateEmpleadoDocumentoDto], required: false })
  @IsOptional()
  @IsArray({ message: 'documentos debe ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateEmpleadoDocumentoDto)
  documentos?: CreateEmpleadoDocumentoDto[];
}
