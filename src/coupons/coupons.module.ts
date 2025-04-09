import { Module } from '@nestjs/common';
import { CouponService } from './coupons.service';
import { CouponController } from './coupons.controller';
import { PrismaModule } from 'src/prismaendpoint/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponsModule {}
