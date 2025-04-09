//backend\src\files\files.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files.controller';
import { CloudinaryService } from './files.service';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class FilesModule {}