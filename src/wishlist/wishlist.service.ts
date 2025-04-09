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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prismaendpoint/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(cognitoUserId: string, productName: string) {
    try {
      // Primero, buscar el usuario por su cognitoId
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

      // Si no existe, crear nuevo item
      return this.prisma.wishItem.create({
        data: {
          userId: user.id,
          productId: product.id,
        },
        include: {
          product: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to add item to wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWishlist(cognitoUserId: string) {
    try {
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
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    try {
      return await this.prisma.wishItem.delete({
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
        `Product "${productName}" is not in the wishlist`,
      );
    }
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
    try {
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
    } catch (error) {
      throw new HttpException(
        'Failed to check wishlist status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
