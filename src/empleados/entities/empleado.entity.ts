import { ApiProperty } from '@nestjs/swagger';

export class EmpleadoDocumento {
  @ApiProperty({ example: '4ba3d6ad-d669-46f9-b66e-93d7d9f339d0' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  empleadoId: string;

  @ApiProperty({ example: 'contrato', description: 'Tipo de documento' })
  tipo: string;

  @ApiProperty({ example: 'Contrato laboral 2026' })
  nombre: string;

  @ApiProperty({ example: 'https://cdn.miapp.com/empleados/contrato-001.pdf' })
  url: string;

  @ApiProperty({ example: '2026-01-15', nullable: true })
  fechaEmision?: string | null;

  @ApiProperty({ example: '2027-01-15', nullable: true })
  fechaVencimiento?: string | null;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<EmpleadoDocumento>) {
    Object.assign(this, partial);
  }
}

export class EmpleadoAuditoria {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-...', nullable: true })
  empleadoId?: string | null;

  @ApiProperty({ example: 'UPDATE' })
  operacion: string;

  @ApiProperty({ nullable: true })
  datosAnteriores?: Record<string, any> | null;

  @ApiProperty({ nullable: true })
  datosNuevos?: Record<string, any> | null;

  @ApiProperty({ nullable: true })
  usuarioDb?: string | null;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  fecha: Date;

  constructor(partial: Partial<EmpleadoAuditoria>) {
    Object.assign(this, partial);
  }
}

export class Empleado {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'EMP-0001' })
  codigoEmpleado: string;

  // Datos personales
  @ApiProperty({ example: 'Juan Carlos' })
  nombres: string;

  @ApiProperty({ example: 'Pérez López' })
  apellidos: string;

  @ApiProperty({ example: '0801199912345' })
  identidad: string;

  @ApiProperty({ example: '08011999123960', nullable: true })
  rtn?: string | null;

  @ApiProperty({ example: '1999-01-15', nullable: true })
  fechaNacimiento?: string | null;

  @ApiProperty({ example: 'masculino', nullable: true })
  genero?: string | null;

  @ApiProperty({ example: 'soltero', nullable: true })
  estadoCivil?: string | null;

  @ApiProperty({ example: '+504 9999-8888', nullable: true })
  telefono?: string | null;

  @ApiProperty({ example: 'juan.perez@empresa.com', nullable: true })
  email?: string | null;

  @ApiProperty({ example: 'Col. Kennedy, Tegucigalpa', nullable: true })
  direccion?: string | null;

  @ApiProperty({
    example: 'https://cdn.miapp.com/empleados/foto-001.jpg',
    nullable: true,
  })
  fotoUrl?: string | null;

  @ApiProperty({ example: 'María Pérez', nullable: true })
  contactoEmergenciaNombre?: string | null;

  @ApiProperty({ example: '+504 9999-7777', nullable: true })
  contactoEmergenciaTelefono?: string | null;

  // Datos laborales
  @ApiProperty({ example: 'd1d2d3d4-...' })
  departamentoId: string;

  @ApiProperty({ example: 'Recursos Humanos', nullable: true })
  departamentoNombre?: string | null;

  @ApiProperty({ example: 'p1p2p3p4-...' })
  puestoId: string;

  @ApiProperty({ example: 'Gerente de RRHH', nullable: true })
  puestoNombre?: string | null;

  @ApiProperty({ example: 'j1j2j3j4-...', nullable: true })
  jefeId?: string | null;

  @ApiProperty({ example: 'Ana Gómez Reyes', nullable: true })
  jefeNombre?: string | null;

  @ApiProperty({ example: '2026-01-15' })
  fechaIngreso: string;

  @ApiProperty({ example: null, nullable: true })
  fechaSalida?: string | null;

  @ApiProperty({ example: 'permanente' })
  tipoContrato: string;

  @ApiProperty({ example: 'activo' })
  estado: string;

  @ApiProperty({ example: 25000.0 })
  salarioBase: number;

  @ApiProperty({ example: 'L' })
  moneda: string;

  // Datos bancarios
  @ApiProperty({ example: 'Banco Atlántida', nullable: true })
  banco?: string | null;

  @ApiProperty({ example: '01010123456789', nullable: true })
  numeroCuenta?: string | null;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-24T16:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [EmpleadoDocumento] })
  documentos: EmpleadoDocumento[];

  constructor(partial: Partial<Empleado>) {
    Object.assign(this, partial);
  }
}
