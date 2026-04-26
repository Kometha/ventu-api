import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { Sample } from './entities/sample.entity';
import { randomUUID } from 'crypto';

/**
 * Servicio para manejar la lógica de negocio de Sample
 * Implementa operaciones CRUD con almacenamiento in-memory
 *
 * En una aplicación real, este servicio se conectaría a una base de datos
 * pero para el template usamos un Map en memoria para simplicidad
 */
@Injectable()
export class SampleService {
  // Logger personalizado para este servicio
  private readonly logger = new Logger(SampleService.name);

  // Almacenamiento in-memory usando Map (clave: id, valor: Sample)
  private samples: Map<string, Sample> = new Map();

  /**
   * Crea un nuevo sample
   * @param createSampleDto - DTO con los datos para crear el sample
   * @returns El sample creado
   */
  create(createSampleDto: CreateSampleDto): Sample {
    this.logger.log(`Creando nuevo sample: ${createSampleDto.name}`);

    // Generar ID único usando UUID
    const id = randomUUID();

    // Crear la nueva entidad con los datos del DTO
    const sample = new Sample({
      id,
      name: createSampleDto.name,
      description: createSampleDto.description || '',
      isActive: createSampleDto.isActive ?? true, // Por defecto true si no se especifica
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Guardar en memoria
    this.samples.set(id, sample);

    this.logger.log(`Sample creado con ID: ${id}`);
    return sample;
  }

  /**
   * Obtiene todos los samples
   * @returns Array con todos los samples almacenados
   */
  findAll(): Sample[] {
    this.logger.log(
      `Obteniendo todos los samples. Total: ${this.samples.size}`,
    );
    return Array.from(this.samples.values());
  }

  /**
   * Obtiene un sample por su ID
   * @param id - ID del sample a buscar
   * @returns El sample encontrado
   * @throws NotFoundException si el sample no existe
   */
  findOne(id: string): Sample {
    this.logger.log(`Buscando sample con ID: ${id}`);

    const sample = this.samples.get(id);

    if (!sample) {
      this.logger.warn(`Sample con ID ${id} no encontrado`);
      throw new NotFoundException(`Sample con ID ${id} no encontrado`);
    }

    return sample;
  }

  /**
   * Actualiza un sample existente
   * @param id - ID del sample a actualizar
   * @param updateSampleDto - DTO con los datos a actualizar
   * @returns El sample actualizado
   * @throws NotFoundException si el sample no existe
   */
  update(id: string, updateSampleDto: UpdateSampleDto): Sample {
    this.logger.log(`Actualizando sample con ID: ${id}`);

    // Verificar que el sample exista
    const existingSample = this.findOne(id);

    // Actualizar los campos proporcionados
    const updatedSample = new Sample({
      ...existingSample,
      ...updateSampleDto, // Los campos de updateSampleDto sobrescriben los existentes
      updatedAt: new Date(), // Actualizar fecha de modificación
    });

    // Guardar el sample actualizado
    this.samples.set(id, updatedSample);

    this.logger.log(`Sample con ID ${id} actualizado exitosamente`);
    return updatedSample;
  }

  /**
   * Elimina un sample
   * @param id - ID del sample a eliminar
   * @throws NotFoundException si el sample no existe
   */
  remove(id: string): void {
    this.logger.log(`Eliminando sample con ID: ${id}`);

    // Verificar que el sample exista
    this.findOne(id);

    // Eliminar de memoria
    this.samples.delete(id);

    this.logger.log(`Sample con ID ${id} eliminado exitosamente`);
  }
}
