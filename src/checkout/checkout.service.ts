import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { CouponService } from 'src/coupons/coupons.service';
import { CheckoutDto } from './dto/create-checkout.dto';
import { PrismaService } from 'src/prismaendpoint/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private couponService: CouponService,
    private cartService: CartService,
  ) {}

  async processCheckout(cognitoUserId: string, checkoutDto: CheckoutDto) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User does not exist in the database');
    }

    const productIds = checkoutDto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products does not exists');
    }

    let total = 0;
    const orderItems = checkoutDto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundException(`Product didn't find`);

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      total += product.price * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    let discount = 0;
    if (checkoutDto.couponCode) {
      const coupon = await this.couponService.validateCoupon(
        checkoutDto.couponCode,
      );
      discount = coupon.discount;
      total -= discount;
    }

    if (total < 0) total = 0;

    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        total,
        discount,
        finalTotal: total,
        paymentMethod: checkoutDto.paymentMethod,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    for (const item of orderItems) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await this.cartService.clearCart(cognitoUserId);

    return order;
  }
}
