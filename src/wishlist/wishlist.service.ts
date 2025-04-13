//backend\src\wishlist\wishlist.service.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prismaendpoint/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(cognitoUserId: string, productName: string) {
    // Buscar el usuario por su cognitoId
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User not found in database');
    }

    // Buscar el producto por nombre
    const product = await this.prisma.product.findFirst({
      where: { name: productName },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productName}" not found`);
    }

    // Verificar si ya existe en la wishlist
    const existingItem = await this.prisma.wishItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (existingItem) {
      return existingItem;
    }

    // Crear nuevo item si no existe
    return this.prisma.wishItem.create({
      data: {
        userId: user.id,
        productId: product.id,
      },
      include: {
        product: true,
      },
    });
  }

  async getWishlist(cognitoUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User not found in database');
    }

    return this.prisma.wishItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });
  }

  async removeFromWishlist(cognitoUserId: string, productName: string) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User not found in database');
    }

    const product = await this.prisma.product.findFirst({
      where: { name: productName },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productName}" not found`);
    }

    const wishlistItem = await this.prisma.wishItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException(
        `Product "${productName}" is not in the wishlist`,
      );
    }

    return this.prisma.wishItem.delete({
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
  }

  async clearWishlist(cognitoUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User not found in database');
    }

    return this.prisma.wishItem.deleteMany({
      where: { userId: user.id },
    });
  }

  async isInWishlist(cognitoUserId: string, productName: string) {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId: cognitoUserId },
    });

    if (!user) {
      throw new BadRequestException('User not found in database');
    }

    const product = await this.prisma.product.findFirst({
      where: { name: productName },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productName}" not found`);
    }

    const item = await this.prisma.wishItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    return !!item;
  }
}
