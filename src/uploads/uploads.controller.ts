import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype.startsWith('image/'));
      },
    }),
  )
  @ApiOperation({
    summary: 'Subir una imagen a Supabase Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen',
        },
        folder: {
          type: 'string',
          example: 'locatarios/logos',
          description: 'Carpeta destino dentro del bucket',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida correctamente',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', example: 'locatarios/logos/2026/uuid.png' },
        publicUrl: {
          type: 'string',
          example:
            'https://xxxx.supabase.co/storage/v1/object/public/public/locatarios/logos/2026/uuid.png',
        },
        bucket: { type: 'string', example: 'public' },
      },
    },
  })
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadImageDto,
  ) {
    return this.uploadsService.uploadImage(file, body.folder);
  }

  @Post('pdf')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype === 'application/pdf');
      },
    }),
  )
  @ApiOperation({ summary: 'Subir un PDF a Supabase Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF',
        },
        folder: {
          type: 'string',
          example: 'contratos/archivos',
          description: 'Carpeta destino dentro del bucket',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'PDF subido correctamente',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', example: 'contratos/archivos/2026/uuid.pdf' },
        publicUrl: { type: 'string', example: 'https://xxxx.supabase.co/storage/v1/object/public/public/contratos/archivos/2026/uuid.pdf' },
        filename: { type: 'string', example: 'contrato-001.pdf' },
        bucket: { type: 'string', example: 'public' },
      },
    },
  })
  uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadPdfDto,
  ) {
    return this.uploadsService.uploadPdf(file, body.folder);
  }
}
