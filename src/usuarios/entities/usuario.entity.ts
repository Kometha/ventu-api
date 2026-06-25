import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';

export class UsuarioLocatario {
  @ApiProperty({ example: 'ff8482e8-1cc7-4e92-a073-bf2080142752' })
  id: string;

  @ApiProperty({ example: 'Cafe Central' })
  nombre: string;

  @ApiProperty({
    example: '4be31bc2-d5f3-4b17-bc57-a6200e7ea9f4',
    nullable: true,
  })
  categoriaId: string | null;

  @ApiProperty({ example: 'Restaurantes', nullable: true })
  categoriaNombre: string | null;

  @ApiProperty({
    description: 'Local del contrato mas reciente del locatario',
    example: 'c3d4e5f6-1111-2222-3333-444455556666',
    nullable: true,
  })
  localId: string | null;

  @ApiProperty({ example: 'Local 101', nullable: true })
  localNombre: string | null;

  @ApiProperty({
    description: 'Planta del local asignado',
    example: 'a1a1a1a1-2222-3333-4444-555566667777',
    nullable: true,
  })
  plantaId: string | null;

  @ApiProperty({ example: 'Planta Baja', nullable: true })
  plantaNombre: string | null;

  constructor(partial: Partial<UsuarioLocatario>) {
    Object.assign(this, partial);
  }
}

export class UsuarioEmpleado {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'EMP-0001' })
  codigoEmpleado: string;

  @ApiProperty({ example: 'p1p2p3p4-...', nullable: true })
  puestoId: string | null;

  @ApiProperty({ example: 'Gerente de RRHH', nullable: true })
  puestoNombre: string | null;

  @ApiProperty({ example: 'd1d2d3d4-...', nullable: true })
  departamentoId: string | null;

  @ApiProperty({ example: 'Recursos Humanos', nullable: true })
  departamentoNombre: string | null;

  constructor(partial: Partial<UsuarioEmpleado>) {
    Object.assign(this, partial);
  }
}

export class Usuario {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'cliente@empresa.com' })
  email: string;

  @ApiProperty({ example: 'Maria Lopez' })
  nombre: string;

  @ApiProperty({ example: 'ML' })
  avatarIniciales: string;

  @ApiProperty({
    description: 'URL de la foto de perfil (empleado.foto_url o avatar_url)',
    nullable: true,
    example: 'https://cdn.miapp.com/empleados/foto-001.jpg',
  })
  fotoUrl: string | null;

  @ApiProperty({ nullable: true, example: '+504 9999-8888' })
  telefono: string | null;

  @ApiProperty({ enum: RolUsuario, example: RolUsuario.CLIENTE })
  rol: RolUsuario;

  @ApiProperty({
    nullable: true,
    example: 'ff8482e8-1cc7-4e92-a073-bf2080142752',
  })
  locatarioId: string | null;

  @ApiProperty({ type: UsuarioLocatario, nullable: true })
  locatario: UsuarioLocatario | null;

  @ApiProperty({
    nullable: true,
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  empleadoId: string | null;

  @ApiProperty({ type: UsuarioEmpleado, nullable: true })
  empleado: UsuarioEmpleado | null;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ nullable: true, example: '2026-06-02T10:00:00.000Z' })
  ultimoAcceso: Date | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<Usuario>) {
    Object.assign(this, partial);
  }
}

export class UsuarioTecnico {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatarIniciales: string;

  constructor(partial: Partial<UsuarioTecnico>) {
    Object.assign(this, partial);
  }
}
