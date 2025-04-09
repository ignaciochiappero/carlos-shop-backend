import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutDto } from './dto/create-checkout.dto';

@ApiTags('checkout')
@ApiBearerAuth()
@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: 'Procesar checkout' })
  async checkout(@Req() req: any, @Body() checkoutDto: CheckoutDto) {
    try {
      const userId = req.user.sub;
      return await this.checkoutService.processCheckout(userId, checkoutDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error en el checkout',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
