//backend\src\files\files.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { createReadStream, unlinkSync, existsSync, statSync } from 'fs';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    // Verificar y mostrar las credenciales (solo para depuración)
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    this.logger.log(
      `Configurating Cloudinary with: Cloud Name: ${cloudName}, API Key: ${apiKey?.substring(0, 4)}...`,
    );

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error(
        'Missing credentials of Cloudinary in environment variables',
      );
      // Mostrar todas las variables de entorno disponibles (sin valores sensibles)
      this.logger.log(
        'Environment Variables availables:',
        Object.keys(process.env),
      );
    }

    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Verificar la configuración
    try {
      // Manera más segura de comprobar si la configuración es correcta
      const testConfig = cloudinary.config();
      this.logger.log(
        `Cloudinay configuration inicialized with Cloud Name: ${testConfig.cloud_name}`,
      );
    } catch (error) {
      this.logger.error(
        'Error inicializing the Cloudinary configuration with the following error:',
        error.message,
      );
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      // Verificar que el archivo exista y tenga contenido
      if (!existsSync(file.path)) {
        throw new Error(`The file does not exist: ${file.path}. `);
      }

      const fileStats = statSync(file.path);
      this.logger.log(
        `Starting upload to Cloudinary: ${file.path} (${fileStats.size} bytes)`,
      );

      // Subir archivo a Cloudinary usando una promesa
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'crombie-shop',
            resource_type: 'auto',
          },
          (error, result) => {
            // Eliminar el archivo local después de subir
            try {
              unlinkSync(file.path);
              this.logger.log(`Local File eliminated: ${file.path}`);
            } catch (err) {
              this.logger.error(`Error eliminating local file: ${err.message}`);
            }

            if (error) {
              this.logger.error(
                `Error udpating file to Cloudinary: ${JSON.stringify(error)}`,
              );
              return reject(error);
            }

            if (!result) {
              this.logger.error('The Result of Cloudinary is undefined o null');
              return reject(
                new Error('Does not receive a result from Cloudinary.'),
              );
            }

            this.logger.log(
              `File updated succesfully to Cloudinary: ${result.public_id}`,
            );
            // Log completo de la respuesta para depuración
            this.logger.log(
              `Complete answer of Cloudinary: ${JSON.stringify(result)}`,
            );
            resolve(result.public_id);
          },
        );

        // Crear stream de lectura y enviarlo a Cloudinary
        createReadStream(file.path).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Actualiza solo el método getFileUrl para manejar rutas completas
  async getFileUrl(publicId: string): Promise<string> {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      this.logger.log(`Generating URL for public_id: ${publicId}`);

      // Si ya es una URL completa, devolverla directamente
      if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
        this.logger.log(`It's now a full URL: ${publicId}`);
        return publicId;
      }

      // Generar URL con transformaciones opcionales
      const url = cloudinary.url(publicId, {
        secure: true,
        transformation: [{ fetch_format: 'auto' }, { quality: 'auto' }],
      });

      if (!url) {
        this.logger.error(`Could not generate URL for ${publicId}`);
        throw new Error('Failed to generate URL');
      }

      this.logger.log(`URL generated for ${publicId}: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Error generating URL for ${publicId}: ${error.message}`,
        error.stack,
      );

      // Fallback: intentar construir la URL manualmente si cloudinary.url falló
      try {
        // Si el public_id ya incluye la carpeta (e.g. "folder/filename")
        const manualUrl = `https://res.cloudinary.com/${this.configService.get<string>('CLOUDINARY_CLOUD_NAME')}/image/upload/${publicId}`;
        this.logger.log(`URL generated manually: ${manualUrl}`);
        return manualUrl;
      } catch (fallbackError) {
        this.logger.error(
          `Error generating URL manually: ${fallbackError.message}`,
        );
        throw error; // Devolver el error original
      }
    }
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(
        `File deleted from Cloudinary: ${publicId}, result: ${result.result}`,
      );
      return result.result === 'ok';
    } catch (error) {
      this.logger.error(
        `Error deleting file ${publicId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
