import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartItemDto } from './dto/cart-item.dto';
import { HttpException } from '@nestjs/common';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  const mockCartService = {
    addToCart: jest.fn(),
    getCart: jest.fn(),
    updateCartItemQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add a product to the cart successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const cartItemDto: CartItemDto = {
        productName: 'Product A',
        quantity: 2,
      };
      const mockResponse = { id: 1, productName: 'Product A', quantity: 2 };

      mockCartService.addToCart.mockResolvedValue(mockResponse);

      const result = await controller.addToCart(req, cartItemDto);

      expect(result).toEqual(mockResponse);
      expect(service.addToCart).toHaveBeenCalledWith('userId', 'Product A', 2);
    });

    it('should handle errors when adding a product to the cart', async () => {
      const req = { user: { sub: 'userId' } };
      const cartItemDto: CartItemDto = {
        productName: 'Product A',
        quantity: 2,
      };

      mockCartService.addToCart.mockRejectedValue(
        new HttpException('Error adding to cart', 400),
      );

      await expect(controller.addToCart(req, cartItemDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getCart', () => {
    it('should retrieve the cart successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const mockResponse = [{ id: 1, productName: 'Product A', quantity: 2 }];

      mockCartService.getCart.mockResolvedValue(mockResponse);

      const result = await controller.getCart(req);

      expect(result).toEqual(mockResponse);
      expect(service.getCart).toHaveBeenCalledWith('userId');
    });

    it('should handle errors when retrieving the cart', async () => {
      const req = { user: { sub: 'userId' } };

      mockCartService.getCart.mockRejectedValue(
        new HttpException('Error retrieving cart', 500),
      );

      await expect(controller.getCart(req)).rejects.toThrow(HttpException);
    });
  });

  describe('updateCartItem', () => {
    it('should update a cart item quantity successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const cartItemDto: CartItemDto = {
        productName: 'Product A',
        quantity: 3,
      };
      const mockResponse = { id: 1, productName: 'Product A', quantity: 3 };

      mockCartService.updateCartItemQuantity.mockResolvedValue(mockResponse);

      const result = await controller.updateCartItem(req, cartItemDto);

      expect(result).toEqual(mockResponse);
      expect(service.updateCartItemQuantity).toHaveBeenCalledWith(
        'userId',
        'Product A',
        3,
      );
    });

    it('should handle errors when updating a cart item quantity', async () => {
      const req = { user: { sub: 'userId' } };
      const cartItemDto: CartItemDto = {
        productName: 'Product A',
        quantity: 3,
      };

      mockCartService.updateCartItemQuantity.mockRejectedValue(
        new HttpException('Error updating cart item', 400),
      );

      await expect(controller.updateCartItem(req, cartItemDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove a product from the cart successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const body = { productName: 'Product A' };
      const mockResponse = { success: true };

      mockCartService.removeFromCart.mockResolvedValue(mockResponse);

      const result = await controller.removeFromCart(req, body);

      expect(result).toEqual(mockResponse);
      expect(service.removeFromCart).toHaveBeenCalledWith(
        'userId',
        'Product A',
      );
    });

    it('should handle errors when removing a product from the cart', async () => {
      const req = { user: { sub: 'userId' } };
      const body = { productName: 'Product A' };

      mockCartService.removeFromCart.mockRejectedValue(
        new HttpException('Error removing from cart', 400),
      );

      await expect(controller.removeFromCart(req, body)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('clearCart', () => {
    it('should clear the cart successfully', async () => {
      const req = { user: { sub: 'userId' } };
      const mockResponse = { success: true };

      mockCartService.clearCart.mockResolvedValue(mockResponse);

      const result = await controller.clearCart(req);

      expect(result).toEqual(mockResponse);
      expect(service.clearCart).toHaveBeenCalledWith('userId');
    });

    it('should handle errors when clearing the cart', async () => {
      const req = { user: { sub: 'userId' } };

      mockCartService.clearCart.mockRejectedValue(
        new HttpException('Error clearing cart', 500),
      );

      await expect(controller.clearCart(req)).rejects.toThrow(HttpException);
    });
  });
});
