//backend\src\files\files.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import { FileResponseDto } from './dto/filre-response.dto';
import { FileUploadInterceptor } from './file-upload-interceptor';
import { CloudinaryService } from './files.service';

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileUploadInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    if (!file) {
      this.logger.error('No se recibió ningún archivo');
      throw new BadRequestException('No file uploaded');
    }

    try {
      this.logger.log(`Recibido archivo: ${file.originalname}, tamaño: ${file.size}, tipo: ${file.mimetype}`);
      
      // Upload to Cloudinary
      const publicId = await this.cloudinaryService.uploadFile(file);
      this.logger.log(`Archivo subido a Cloudinary con ID: ${publicId}`);

      // Generar la URL directamente aquí para devolver ambos valores
      const url = await this.cloudinaryService.getFileUrl(publicId);
      this.logger.log(`URL generada: ${url}`);

      return {
        message: 'File uploaded successfully',
        fileKey: publicId,
        url: url
      };
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`, error.stack);
      throw new HttpException(
        `Error uploading file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Corrección importante en esta ruta
  // El problema es que la ruta /files/:publicId colisiona con /files/test
  // Cambiamos la ruta para evitar conflictos
  @Get('url/:publicId')
  async getFile(@Param('publicId') publicId: string): Promise<FileResponseDto> {
    if (!publicId) {
      this.logger.error('No se proporcionó ID público');
      throw new BadRequestException('Public ID is required');
    }

    try {
      this.logger.log(`Generando URL para archivo con ID: ${publicId}`);
      const url = await this.cloudinaryService.getFileUrl(publicId);
      
      this.logger.log(`URL generada: ${url}`);
      
      if (!url) {
        this.logger.error(`No se pudo generar URL para: ${publicId}`);
        throw new Error('Failed to generate URL');
      }
      
      const response: FileResponseDto = {
        message: 'File URL generated successfully',
        url: url,
        fileKey: publicId
      };
      
      this.logger.log(`Respuesta completa: ${JSON.stringify(response)}`);
      
      return response;
    } catch (error) {
      this.logger.error(`Error al obtener URL: ${error.message}`, error.stack);
      throw new HttpException(
        `Error getting file URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':publicId')
  async deleteFile(
    @Param('publicId') publicId: string,
  ): Promise<FileResponseDto> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    try {
      await this.cloudinaryService.deleteFile(publicId);

      return {
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`, error.stack);
      throw new HttpException(
        `Error deleting file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  @Get('test')
  testEndpoint() {
    return { message: 'Files controller is working!' };
  }
}