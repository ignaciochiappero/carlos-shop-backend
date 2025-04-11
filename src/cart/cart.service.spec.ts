import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add a product to the cart successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };
      const mockCartItem = {
        id: 'cart1',
        userId: 'user1',
        productId: 'product1',
        quantity: 2,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.cartItem.findUnique.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue(mockCartItem);

      const result = await service.addToCart('cognito1', 'Test Product', 2);

      expect(result).toEqual(mockCartItem);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoId: 'cognito1' },
      });
      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Product' },
      });
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          productId: 'product1',
          quantity: 2,
        },
        include: { product: true },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addToCart('cognito1', 'Test Product', 2),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.addToCart('cognito1', 'Test Product', 2),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCart', () => {
    it('should return the user cart successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockCart = [
        { id: 'cart1', productId: 'product1', userId: 'user1', quantity: 2 },
      ];

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.cartItem.findMany.mockResolvedValue(mockCart);

      const result = await service.getCart('cognito1');

      expect(result).toEqual(mockCart);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoId: 'cognito1' },
      });
      expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: { product: true },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getCart('cognito1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update the quantity of a cart item successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };
      const mockUpdatedCartItem = {
        id: 'cart1',
        userId: 'user1',
        productId: 'product1',
        quantity: 5,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.cartItem.update.mockResolvedValue(mockUpdatedCartItem);

      const result = await service.updateCartItemQuantity(
        'cognito1',
        'Test Product',
        5,
      );

      expect(result).toEqual(mockUpdatedCartItem);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user1',
            productId: 'product1',
          },
        },
        data: { quantity: 5 },
        include: { product: true },
      });
    });

    it('should throw NotFoundException if cart item does not exist', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.cartItem.update.mockRejectedValue(new Error());

      await expect(
        service.updateCartItemQuantity('cognito1', 'Test Product', 5),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromCart', () => {
    it('should remove a product from the cart successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };
      const mockDeletedCartItem = {
        id: 'cart1',
        userId: 'user1',
        productId: 'product1',
        quantity: 2,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.cartItem.delete.mockResolvedValue(mockDeletedCartItem);

      const result = await service.removeFromCart('cognito1', 'Test Product');

      expect(result).toEqual(mockDeletedCartItem);
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user1',
            productId: 'product1',
          },
        },
        include: { product: true },
      });
    });

    it('should throw NotFoundException if cart item does not exist', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.cartItem.delete.mockRejectedValue(new Error());

      await expect(
        service.removeFromCart('cognito1', 'Test Product'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart', () => {
    it('should clear the cart successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.clearCart('cognito1');

      expect(result).toEqual({ count: 3 });
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.clearCart('cognito1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
