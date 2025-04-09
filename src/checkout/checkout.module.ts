import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { PrismaService } from 'src/prismaendpoint/prisma.service';
import { CouponService } from 'src/coupons/coupons.service';
import { CartService } from 'src/cart/cart.service';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, CouponService, CartService],
})
export class CheckoutModule {}
