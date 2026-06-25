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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario, UsuarioTecnico } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear usuario (solo ADMIN)' })
  @ApiResponse({ status: 201, type: Usuario })
  create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios (solo ADMIN)' })
  @ApiResponse({ status: 200, type: [Usuario] })
  findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll();
  }

  @Get('tecnicos')
  @Roles(RolUsuario.ADMIN, RolUsuario.SUPERVISOR, RolUsuario.TECNICO)
  @ApiOperation({ summary: 'Obtener tecnicos activos disponibles' })
  @ApiResponse({ status: 200, type: [UsuarioTecnico] })
  findTecnicos(): Promise<UsuarioTecnico[]> {
    return this.usuariosService.findTecnicosDisponibles();
  }

  // ----------------- Perfil propio (cualquier usuario autenticado) -----------------

  @Get('me')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: Usuario })
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<Usuario> {
    return this.usuariosService.findByIdOrFail(user.id);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambiar la contraseña del usuario autenticado' })
  @ApiResponse({ status: 204, description: 'Contraseña actualizada' })
  changeMyPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.usuariosService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Patch('me/avatar')
  @ApiOperation({
    summary: 'Cambiar la foto de perfil del usuario autenticado',
  })
  @ApiResponse({ status: 200, type: Usuario })
  updateMyAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAvatarDto,
  ): Promise<Usuario> {
    return this.usuariosService.updateAvatar(user.id, dto.fotoUrl);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Obtener usuario por ID (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, type: Usuario })
  findOne(@Param('id') id: string): Promise<Usuario> {
    return this.usuariosService.findByIdOrFail(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, type: Usuario })
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar usuario (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usuariosService.remove(id);
  }
}
