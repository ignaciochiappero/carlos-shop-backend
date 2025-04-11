import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('WishlistController', () => {
  let controller: WishlistController;
  let service: WishlistService;

  const mockWishlistService = {
    addToWishlist: jest.fn(),
    getWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn(),
    clearWishlist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockWishlistService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<WishlistController>(WishlistController);
    service = module.get<WishlistService>(WishlistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToWishlist', () => {
    it('should add a product to the wishlist successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const wishlistItemDto = { productName: 'Product A' };
      const mockResponse = { id: 1, productName: 'Product A' };

      mockWishlistService.addToWishlist.mockResolvedValue(mockResponse);

      const result = await controller.addToWishlist(req, wishlistItemDto);

      expect(result).toEqual(mockResponse);
      expect(service.addToWishlist).toHaveBeenCalledWith('userId', 'Product A');
    });

    it('should handle errors when adding a product to the wishlist', async () => {
      const req = { user: { sub: 'userId' } };
      const wishlistItemDto = { productName: 'Product A' };

      mockWishlistService.addToWishlist.mockRejectedValue(
        new HttpException('Error adding product', HttpStatus.BAD_REQUEST),
      );

      await expect(
        controller.addToWishlist(req, wishlistItemDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getWishlist', () => {
    it('should return the user wishlist successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const mockResponse = [{ id: 1, productName: 'Product A' }];

      mockWishlistService.getWishlist.mockResolvedValue(mockResponse);

      const result = await controller.getWishlist(req);

      expect(result).toEqual(mockResponse);
      expect(service.getWishlist).toHaveBeenCalledWith('userId');
    });

    it('should handle errors when retrieving the wishlist', async () => {
      const req = { user: { sub: 'userId' } };

      mockWishlistService.getWishlist.mockRejectedValue(
        new HttpException(
          'Error retrieving wishlist',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      await expect(controller.getWishlist(req)).rejects.toThrow(HttpException);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove a product from the wishlist successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const productName = 'Product A';
      const mockResponse = { success: true };

      mockWishlistService.removeFromWishlist.mockResolvedValue(mockResponse);

      const result = await controller.removeFromWishlist(req, productName);

      expect(result).toEqual(mockResponse);
      expect(service.removeFromWishlist).toHaveBeenCalledWith(
        'userId',
        'Product A',
      );
    });

    it('should handle errors when removing a product from the wishlist', async () => {
      const req = { user: { sub: 'userId' } };
      const productName = 'Product A';

      mockWishlistService.removeFromWishlist.mockRejectedValue(
        new HttpException('Error removing product', HttpStatus.BAD_REQUEST),
      );

      await expect(
        controller.removeFromWishlist(req, productName),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('checkInWishlist', () => {
    it('should check if a product is in the wishlist successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const productName = 'Product A';
      const mockResponse = true;

      mockWishlistService.isInWishlist.mockResolvedValue(mockResponse);

      const result = await controller.checkInWishlist(req, productName);

      expect(result).toEqual(mockResponse);
      expect(service.isInWishlist).toHaveBeenCalledWith('userId', 'Product A');
    });

    it('should handle errors when checking if a product is in the wishlist', async () => {
      const req = { user: { sub: 'userId' } };
      const productName = 'Product A';

      mockWishlistService.isInWishlist.mockRejectedValue(
        new HttpException(
          'Error checking product',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      await expect(
        controller.checkInWishlist(req, productName),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('clearWishlist', () => {
    it('should clear the wishlist successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const mockResponse = { success: true };

      mockWishlistService.clearWishlist.mockResolvedValue(mockResponse);

      const result = await controller.clearWishlist(req);

      expect(result).toEqual(mockResponse);
      expect(service.clearWishlist).toHaveBeenCalledWith('userId');
    });

    it('should handle errors when clearing the wishlist', async () => {
      const req = { user: { sub: 'userId' } };

      mockWishlistService.clearWishlist.mockRejectedValue(
        new HttpException(
          'Error clearing wishlist',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      await expect(controller.clearWishlist(req)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
