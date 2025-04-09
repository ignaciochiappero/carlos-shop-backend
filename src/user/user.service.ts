import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prismaendpoint/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser({
    email,
    userName,
    password,
    cognitoId,
  }: {
    email: string;
    userName: string;
    password: string;
    cognitoId: string;
  }) {
    try {
      return await this.prisma.user.create({
        data: {
          email,
          userName,
          password,
          cognitoId,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(id: string) {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      throw new HttpException(
        'Error fetching user by ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw new HttpException(
        'Error fetching user by email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByCognitoId(cognitoId: string) {
    try {
      return await this.prisma.user.findUnique({ where: { cognitoId } });
    } catch (error) {
      throw new HttpException(
        'Error fetching user by Cognito ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new HttpException(
        'Error fetching users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(
    id: string,
    data: { email?: string; userName?: string; role?: 'ADMIN' | 'USER' },
  ) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new HttpException(
        'Error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Cart methods
  async addToCart(userId: string, productId: string, quantity: number) {
    try {
      const existingItem = await this.prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existingItem) {
        return this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
        });
      }

      return this.prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error updating cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeFromCart(userId: string, productId: string) {
    try {
      return await this.prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error removing item from cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCart(userId: string) {
    try {
      return await this.prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
    } catch (error) {
      throw new HttpException(
        'Error fetching cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Wishlist methods
  async addToWishlist(userId: string, productId: string) {
    try {
      const existingItem = await this.prisma.wishItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existingItem) {
        return existingItem;
      }

      return this.prisma.wishItem.create({
        data: {
          userId,
          productId,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error updating wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeFromWishlist(userId: string, productId: string) {
    try {
      return await this.prisma.wishItem.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error removing item from wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWishlist(userId: string) {
    try {
      return await this.prisma.wishItem.findMany({
        where: { userId },
        include: { product: true },
      });
    } catch (error) {
      throw new HttpException(
        'Error fetching wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
