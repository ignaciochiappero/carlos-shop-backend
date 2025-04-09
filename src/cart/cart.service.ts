//backend\src\cart\cart.service.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prismaendpoint/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(
    cognitoUserId: string,
    productName: string,
    quantity: number,
  ) {
    // Primero, buscar el usuario por su cognitoId
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User does not exist in the database');
    }

    // Buscar el producto por nombre
    const product = await this.prisma.product.findFirst({
      where: { name: productName },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productName}" didn't find`);
    }

    // Verificar si ya existe el item en el carrito
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id, // Usar el ID interno del usuario
          productId: product.id,
        },
      },
    });

    if (existingItem) {
      // Si existe, actualizar la cantidad
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: {
          product: true,
        },
      });
    }

    // Si no existe, crear nuevo item
    return this.prisma.cartItem.create({
      data: {
        userId: user.id, // Usar el ID interno del usuario
        productId: product.id,
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async getCart(cognitoUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User does not exist in the database');
    }

    return this.prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });
  }

  async updateCartItemQuantity(
    cognitoUserId: string,
    productName: string,
    quantity: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User does not exist in the database');
    }

    const product = await this.prisma.product.findFirst({
      where: { name: productName },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productName}" didn't find`);
    }

    try {
      return await this.prisma.cartItem.update({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
        data: { quantity },
        include: {
          product: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        `Product "${productName}" is not in the cart`,
      );
    }
  }

  async removeFromCart(cognitoUserId: string, productName: string) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User does not exist in the database');
    }

    const product = await this.prisma.product.findFirst({
      where: { name: productName },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productName}" didn't find`);
    }

    try {
      return await this.prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
        include: {
          product: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        `Product "${productName}" is not in the cart`,
      );
    }
  }

  async clearCart(cognitoUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User does not exist in the database');
    }

    return this.prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });
  }
}
