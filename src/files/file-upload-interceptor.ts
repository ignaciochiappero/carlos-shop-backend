//backend\src\files\file-upload-interceptor.ts

import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export function FileUploadInterceptor(
  fieldName: string = 'file',
  options: MulterOptions = {},
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;

    constructor(private configService: ConfigService) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = './uploads';
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Default MulterOptions
      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
          ];

          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new Error(
                'Invalid file type. Only JPEG, PNG, GIF images and PDFs are allowed.',
              ),
              false,
            );
          }
        },
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        ...options,
      };

      this.fileInterceptor = new (FileInterceptor(fieldName, multerOptions))();
    }

    intercept(
      context: Parameters<NestInterceptor['intercept']>[0],
      next: Parameters<NestInterceptor['intercept']>[1],
    ) {
      return this.fileInterceptor.intercept(context, next);
    }
  }

  return mixin(Interceptor);
}
