import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupons.controller';
import { CouponService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

describe('CouponController', () => {
  let controller: CouponController;
  let service: CouponService;

  const mockCouponService = {
    createCoupon: jest.fn(),
    getCoupons: jest.fn(),
    getCouponByCode: jest.fn(),
    updateCoupon: jest.fn(),
    deleteCoupon: jest.fn(),
    validateCoupon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponService,
          useValue: mockCouponService,
        },
      ],
    }).compile();

    controller = module.get<CouponController>(CouponController);
    service = module.get<CouponService>(CouponService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('create', () => {
    it('should call createCoupon with the correct parameters', async () => {
      const createCouponDto: CreateCouponDto = { code: 'TEST10', discount: 10 };
      const mockResponse = { id: '1', ...createCouponDto };
      mockCouponService.createCoupon.mockResolvedValue(mockResponse);

      const result = await controller.create(createCouponDto);

      expect(service.createCoupon).toHaveBeenCalledWith(createCouponDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    it('should call getCoupons and return all coupons', async () => {
      const mockResponse = [
        { id: '1', code: 'TEST10', discount: 10 },
        { id: '2', code: 'TEST20', discount: 20 },
      ];
      mockCouponService.getCoupons.mockResolvedValue(mockResponse);

      const result = await controller.findAll();

      expect(service.getCoupons).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call getCouponByCode with the correct parameters', async () => {
      const mockResponse = { id: '1', code: 'TEST10', discount: 10 };
      mockCouponService.getCouponByCode.mockResolvedValue(mockResponse);

      const result = await controller.findOne('TEST10');

      expect(service.getCouponByCode).toHaveBeenCalledWith('TEST10');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call updateCoupon with the correct parameters', async () => {
      const updateCouponDto: UpdateCouponDto = { discount: 15 };
      const mockResponse = { id: '1', code: 'TEST10', discount: 15 };
      mockCouponService.updateCoupon.mockResolvedValue(mockResponse);

      const result = await controller.update('1', updateCouponDto);

      expect(service.updateCoupon).toHaveBeenCalledWith('1', updateCouponDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('remove', () => {
    it('should call deleteCoupon with the correct parameters', async () => {
      const mockResponse = { success: true };
      mockCouponService.deleteCoupon.mockResolvedValue(mockResponse);

      const result = await controller.remove('1');

      expect(service.deleteCoupon).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validate', () => {
    it('should call validateCoupon with the correct parameters', async () => {
      const mockResponse = { valid: true, discount: 10 };
      mockCouponService.validateCoupon.mockResolvedValue(mockResponse);

      const result = await controller.validate('TEST10');

      expect(service.validateCoupon).toHaveBeenCalledWith('TEST10');
      expect(result).toEqual(mockResponse);
    });
  });
});
