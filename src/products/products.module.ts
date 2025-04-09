//backend\src\products\products.module.ts

import { Module } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { CloudinaryService } from 'src/files/files.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, CloudinaryService],
  exports: [ProductsService],
})
export class ProductsModule {}