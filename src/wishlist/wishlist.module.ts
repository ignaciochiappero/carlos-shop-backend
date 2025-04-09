//backend\src\whishlist\whishlist.module.ts

import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { JwtCustomModule } from '../auth/jwt/jwt.module';

@Module({
  imports: [JwtCustomModule],
  providers: [WishlistService, PrismaService],
  controllers: [WishlistController],
  exports: [WishlistService],
})
export class WishlistModule {}