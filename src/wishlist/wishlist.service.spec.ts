import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WishlistService', () => {
  let service: WishlistService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
    },
    wishItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToWishlist', () => {
    it('should add a product to the wishlist successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };
      const mockWishItem = {
        id: 'wish1',
        userId: 'user1',
        productId: 'product1',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.wishItem.findUnique.mockResolvedValue(null);
      mockPrismaService.wishItem.create.mockResolvedValue(mockWishItem);

      const result = await service.addToWishlist('cognito1', 'Test Product');

      expect(result).toEqual(mockWishItem);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoId: 'cognito1' },
      });
      expect(prismaService.product.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Product' },
      });
      expect(prismaService.wishItem.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          productId: 'product1',
        },
        include: {
          product: true,
        },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addToWishlist('cognito1', 'Test Product'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(
        service.addToWishlist('cognito1', 'Test Product'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWishlist', () => {
    it('should return the wishlist successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockWishlist = [
        {
          id: 'wish1',
          userId: 'user1',
          productId: 'product1',
          product: { id: 'product1', name: 'Test Product' },
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.wishItem.findMany.mockResolvedValue(mockWishlist);

      const result = await service.getWishlist('cognito1');

      expect(result).toEqual(mockWishlist);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoId: 'cognito1' },
      });
      expect(prismaService.wishItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: { product: true },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getWishlist('cognito1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove a product from the wishlist successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };
      const mockWishItem = {
        id: 'wish1',
        userId: 'user1',
        productId: 'product1',
      };

      // Mock para encontrar al usuario
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock para encontrar el producto
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      // Mock para encontrar el producto en la wishlist
      mockPrismaService.wishItem.findUnique.mockResolvedValue(mockWishItem);

      // Mock para eliminar el producto de la wishlist
      mockPrismaService.wishItem.delete.mockResolvedValue(mockWishItem);

      // Llamada al servicio
      const result = await service.removeFromWishlist(
        'cognito1',
        'Test Product',
      );

      // Validaciones
      expect(result).toEqual(mockWishItem);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoId: 'cognito1' },
      });
      expect(prismaService.product.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Product' },
      });
      expect(prismaService.wishItem.findUnique).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user1',
            productId: 'product1',
          },
        },
      });
      expect(prismaService.wishItem.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user1',
            productId: 'product1',
          },
        },
        include: {
          product: true,
        },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.removeFromWishlist('cognito1', 'Test Product'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(
        service.removeFromWishlist('cognito1', 'Test Product'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if the wishlist item does not exist', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      const mockProduct = { id: 'product1', name: 'Test Product' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.wishItem.findUnique.mockResolvedValue(null);

      await expect(
        service.removeFromWishlist('cognito1', 'Test Product'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearWishlist', () => {
    it('should clear the wishlist successfully', async () => {
      const mockUser = { id: 'user1', cognitoId: 'cognito1' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.wishItem.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.clearWishlist('cognito1');

      expect(result).toEqual({ count: 2 });
      expect(prismaService.wishItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.clearWishlist('cognito1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
