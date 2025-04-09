//backend\src\cart\cart.module.ts

import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { JwtCustomModule } from '../auth/jwt/jwt.module';

@Module({
  imports: [JwtCustomModule],
  providers: [CartService, PrismaService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}