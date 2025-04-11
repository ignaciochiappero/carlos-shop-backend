import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckoutDto } from './dto/create-checkout.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let service: CheckoutService;

  // Mock for the CheckoutService
  const mockCheckoutService = {
    processCheckout: jest.fn(),
  };

  // Mock request object simulating an authenticated user
  const mockRequest = {
    user: { sub: 'user-id' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController], // Define the controller to test
      providers: [
        {
          provide: CheckoutService, // Provide the mock service
          useValue: mockCheckoutService,
        },
      ],
    })
      // Override the JwtAuthGuard to simulate authentication
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get<CheckoutService>(CheckoutService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should call processCheckout in the service with the correct parameters', async () => {
    // Define input data
    const checkoutDto: CheckoutDto = {
      items: [{ productId: 'prod-1', quantity: 2 }],
      paymentMethod: 'mercadopago',
      couponCode: 'DISCOUNT50',
    };

    // Define the mock response from the service
    const mockResponse = { id: 'order-id', total: 100 };
    mockCheckoutService.processCheckout.mockResolvedValue(mockResponse);

    // Call the controller method
    const result = await controller.checkout(mockRequest, checkoutDto);

    // Assertions
    expect(mockCheckoutService.processCheckout).toHaveBeenCalledWith(
      'user-id', // The user ID from the mock request
      checkoutDto, // The input DTO
    );
    expect(result).toEqual(mockResponse); // Ensure the response matches the mock
  });

  it('should throw an HttpException if an error occurs in the service', async () => {
    // Define input data
    const checkoutDto: CheckoutDto = {
      items: [{ productId: 'prod-1', quantity: 2 }],
      paymentMethod: 'mercadopago',
      couponCode: 'DISCOUNT50',
    };

    // Simulate an error being thrown by the service
    mockCheckoutService.processCheckout.mockRejectedValue(
      new Error('Something went wrong'),
    );

    // Expect the controller to throw an HttpException
    await expect(controller.checkout(mockRequest, checkoutDto)).rejects.toThrow(
      new HttpException('Something went wrong', HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw a generic HttpException if the error has no message', async () => {
    // Define input data
    const checkoutDto: CheckoutDto = {
      items: [{ productId: 'prod-1', quantity: 2 }],
      paymentMethod: 'mercadopago',
    };

    // Simulate an error with no message
    mockCheckoutService.processCheckout.mockRejectedValue({});

    // Expect the controller to throw a generic HttpException
    await expect(controller.checkout(mockRequest, checkoutDto)).rejects.toThrow(
      new HttpException('Error en el checkout', HttpStatus.BAD_REQUEST),
    );
  });
});
