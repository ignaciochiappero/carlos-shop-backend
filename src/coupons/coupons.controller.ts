/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponService } from './coupons.service';
import { RolesGuard } from '../auth/roles.guard';

import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';

@Controller('coupons')
@UseGuards(RolesGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(@Body() body: CreateCouponDto) {
    return this.couponService.createCoupon(body);
  }

  @Get()
  //@Roles(Role.ADMIN)
  async findAll() {
    return this.couponService.getCoupons();
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return this.couponService.getCouponByCode(code);
  }

  @Patch(':id')
  //@Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() body: UpdateCouponDto) {
    return this.couponService.updateCoupon(id, body);
  }

  @Delete(':id')
  //@Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }

  @Post('validate/:code')
  async validate(@Param('code') code: string) {
    return this.couponService.validateCoupon(code);
  }
}
