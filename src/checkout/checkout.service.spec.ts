import { CheckoutService } from './checkout.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  order: {
    create: jest.fn(),
  },
};

const mockCouponService = {
  validateCoupon: jest.fn(),
};

const mockCartService = {
  clearCart: jest.fn(),
};

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;

  beforeEach(() => {
    checkoutService = new CheckoutService(
      mockPrismaService as any,
      mockCouponService as any,
      mockCartService as any,
    );
    jest.clearAllMocks();
  });

  it('should throw an error if the user does not exist', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      checkoutService.processCheckout('fake-cognito-id', {
        items: [],
        paymentMethod: 'mercadopago',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if a product is missing', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-id' });
    mockPrismaService.product.findMany.mockResolvedValue([]);

    await expect(
      checkoutService.processCheckout('fake-cognito-id', {
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'mercadopago',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should process checkout without a coupon', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-id' });
    mockPrismaService.product.findMany.mockResolvedValue([
      { id: 'prod-1', price: 100, stock: 10, name: 'Product 1' },
    ]);
    mockPrismaService.order.create.mockResolvedValue({ id: 'order-id' });
    mockPrismaService.product.update.mockResolvedValue({});
    mockCartService.clearCart.mockResolvedValue(undefined);

    const result = await checkoutService.processCheckout('fake-cognito-id', {
      items: [{ productId: 'prod-1', quantity: 2 }],
      paymentMethod: 'mercadopago',
    });

    expect(result).toEqual({ id: 'order-id' });
    expect(mockCartService.clearCart).toHaveBeenCalledWith('fake-cognito-id');
  });

  it('should apply coupon discount', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-id' });
    mockPrismaService.product.findMany.mockResolvedValue([
      { id: 'prod-1', price: 100, stock: 10, name: 'Product 1' },
    ]);
    mockCouponService.validateCoupon.mockResolvedValue({ discount: 50 });
    mockPrismaService.order.create.mockResolvedValue({ id: 'order-id' });
    mockPrismaService.product.update.mockResolvedValue({});
    mockCartService.clearCart.mockResolvedValue(undefined);

    const result = await checkoutService.processCheckout('fake-cognito-id', {
      items: [{ productId: 'prod-1', quantity: 1 }],
      paymentMethod: 'mercadopago',
      couponCode: 'DESC50',
    });

    expect(mockCouponService.validateCoupon).toHaveBeenCalledWith('DESC50');
    expect(result).toEqual({ id: 'order-id' });
  });
});
