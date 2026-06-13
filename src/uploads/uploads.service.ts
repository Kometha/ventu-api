import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';
import { randomUUID } from 'crypto';

export type UploadedImageResult = {
  path: string;
  publicUrl: string;
  bucket: string;
};

export type UploadedPdfResult = {
  path: string;
  publicUrl: string;
  filename: string;
  bucket: string;
};

@Injectable()
export class UploadsService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.bucket = this.configService.get<string>(
      'SUPABASE_STORAGE_BUCKET',
      'public',
    );

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en variables de entorno.',
      );
    }

    // Las keys anon/service_role de Supabase son JWT (3 partes separadas por punto).
    const keyParts = supabaseServiceRoleKey.split('.');
    if (keyParts.length !== 3) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY no es valida. Debe ser la key JWT service_role de Supabase (no el password de Postgres).',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  private getSafeExtension(fileName: string, mimeType: string): string {
    const extensionFromName = extname(fileName).toLowerCase();
    if (extensionFromName) return extensionFromName;

    if (mimeType === 'image/jpeg') return '.jpg';
    if (mimeType === 'image/png') return '.png';
    if (mimeType === 'image/webp') return '.webp';
    if (mimeType === 'image/gif') return '.gif';

    return '.bin';
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'locatarios/logos',
  ): Promise<UploadedImageResult> {
    if (!file) {
      throw new BadRequestException('Debes enviar un archivo en el campo "file".');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten archivos de imagen.');
    }

    const extension = this.getSafeExtension(file.originalname, file.mimetype);
    const filePath = `${folder}/${new Date().getUTCFullYear()}/${randomUUID()}${extension}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      if (error.message?.includes('Invalid Compact JWS')) {
        throw new UnauthorizedException(
          'SUPABASE_SERVICE_ROLE_KEY invalida. Usa la service_role key JWT de Supabase.',
        );
      }
      throw new InternalServerErrorException(
        `No se pudo subir la imagen a Supabase: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: data.publicUrl,
      bucket: this.bucket,
    };
  }

  async uploadPdf(
    file: Express.Multer.File,
    folder = 'contratos/archivos',
  ): Promise<UploadedPdfResult> {
    if (!file) {
      throw new BadRequestException('Debes enviar un archivo en el campo "file".');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF.');
    }

    const uniqueName = `${randomUUID()}.pdf`;
    const filePath = `${folder}/${new Date().getUTCFullYear()}/${uniqueName}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      if (error.message?.includes('Invalid Compact JWS')) {
        throw new UnauthorizedException(
          'SUPABASE_SERVICE_ROLE_KEY invalida. Usa la service_role key JWT de Supabase.',
        );
      }
      throw new InternalServerErrorException(
        `No se pudo subir el PDF a Supabase: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: data.publicUrl,
      filename: file.originalname,
      bucket: this.bucket,
    };
  }
}
