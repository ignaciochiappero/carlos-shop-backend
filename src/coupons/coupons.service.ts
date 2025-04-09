/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prismaendpoint/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async createCoupon(data: CreateCouponDto) {
    return this.prisma.coupon.create({ data });
  }

  async getCoupons() {
    return this.prisma.coupon.findMany();
  }

  async getCouponByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async updateCoupon(id: string, data: UpdateCouponDto) {
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  async validateCoupon(code: string) {
    const coupon = await this.getCouponByCode(code);

    if (!coupon.isActive) throw new BadRequestException('Inactive coupon');

    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      throw new BadRequestException('Expired coupon');

    return coupon;
  }
}
