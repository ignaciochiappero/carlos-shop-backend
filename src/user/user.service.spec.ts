import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prismaendpoint/prisma.service';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    wishItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser({
        email: 'test@example.com',
        userName: 'testuser',
        password: 'password',
        cognitoId: 'cognito-id',
      });

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          userName: 'testuser',
          password: 'password',
          cognitoId: 'cognito-id',
        },
      });
    });

    it('should throw ConflictException if email or CognitoId already exists', async () => {
      const error = new PrismaClientKnownRequestError('Conflict', {
        code: 'P2002',
        clientVersion: '4.0.0',
      });
      mockPrismaService.user.create.mockRejectedValue(error);

      await expect(
        service.createUser({
          email: 'test@example.com',
          userName: 'testuser',
          password: 'password',
          cognitoId: 'cognito-id',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(
        service.createUser({
          email: 'test@example.com',
          userName: 'testuser',
          password: 'password',
          cognitoId: 'cognito-id',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(service.getUserById('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('addToCart', () => {
    it('should add a new item to the cart if it does not exist', async () => {
      const mockCartItem = {
        id: '1',
        userId: 'user1',
        productId: 'product1',
        quantity: 3,
      };
      mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
      mockPrismaService.cartItem.create.mockResolvedValue(mockCartItem);

      const result = await service.addToCart('user1', 'product1', 3);

      expect(result).toEqual(mockCartItem);
      expect(mockPrismaService.cartItem.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          productId: 'product1',
          quantity: 3,
        },
      });
    });

    it('should update the quantity if the item already exists in the cart', async () => {
      const mockExistingCartItem = {
        id: '1',
        userId: 'user1',
        productId: 'product1',
        quantity: 2,
      };
      const mockUpdatedCartItem = {
        id: '1',
        userId: 'user1',
        productId: 'product1',
        quantity: 5,
      };
      mockPrismaService.cartItem.findUnique.mockResolvedValue(
        mockExistingCartItem,
      );
      mockPrismaService.cartItem.update.mockResolvedValue(mockUpdatedCartItem);

      const result = await service.addToCart('user1', 'product1', 3);

      expect(result).toEqual(mockUpdatedCartItem);
      expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 5 },
      });
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockPrismaService.cartItem.findUnique.mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(service.addToCart('user1', 'product1', 3)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove an item from the cart successfully', async () => {
      const mockCartItem = { id: '1', userId: 'user1', productId: 'product1' };
      mockPrismaService.cartItem.delete.mockResolvedValue(mockCartItem);

      const result = await service.removeFromCart('user1', 'product1');

      expect(result).toEqual(mockCartItem);
      expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user1',
            productId: 'product1',
          },
        },
      });
    });

    it('should throw NotFoundException if the cart item does not exist', async () => {
      const error = new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '4.0.0',
      });
      mockPrismaService.cartItem.delete.mockRejectedValue(error);

      await expect(service.removeFromCart('user1', 'product1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockPrismaService.cartItem.delete.mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(service.removeFromCart('user1', 'product1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
