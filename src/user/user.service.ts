//backend\src\user\user.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or CognitoId already exists');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user by ID');
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user by email');
    }
  }

  async getUserByCognitoId(cognitoId: string) {
    try {
      console.log(`Buscando usuario con cognitoId: ${cognitoId}`);
      
      const user = await this.prisma.user.findUnique({ 
        where: { cognitoId },
        // Asegúrate de seleccionar todos los campos necesarios
        select: {
          id: true,
          email: true,
          userName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          cognitoId: true
        }
      });
      
      if (!user) {
        console.log(`No se encontró usuario con cognitoId: ${cognitoId}`);
        throw new NotFoundException(`Usuario con ID de Cognito ${cognitoId} no encontrado`);
      }
      
      console.log(`Usuario encontrado: ${user.id}`);
      return user;
    } catch (error) {
      console.error(`Error al buscar usuario por cognitoId ${cognitoId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar usuario por ID de Cognito');
    }
  }

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async updateUser(
    id: string,
    data: { email?: string; userName?: string; role?: 'ADMIN' | 'USER' },
  ) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
      });
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Error deleting user');
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
      throw new InternalServerErrorException('Error updating cart');
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
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Cart item for user ${userId} and product ${productId} not found`,
        );
      }
      throw new InternalServerErrorException('Error removing item from cart');
    }
  }

  async getCart(userId: string) {
    try {
      return await this.prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching cart');
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
      throw new InternalServerErrorException('Error updating wishlist');
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
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Wishlist item for user ${userId} and product ${productId} not found`,
        );
      }
      throw new InternalServerErrorException(
        'Error removing item from wishlist',
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
      throw new InternalServerErrorException('Error fetching wishlist');
    }
  }
}
