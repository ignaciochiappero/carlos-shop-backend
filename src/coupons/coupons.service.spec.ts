import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupons.service';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

describe('CouponService', () => {
  let service: CouponService;
  let prisma: PrismaService;

  const mockPrismaService = {
    coupon: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after every test
  });

  describe('createCoupon', () => {
    it('should create a coupon successfully', async () => {
      const createCouponDto: CreateCouponDto = { code: 'TEST10', discount: 10 };
      const mockResponse = { id: '1', ...createCouponDto };
      mockPrismaService.coupon.create.mockResolvedValue(mockResponse);

      const result = await service.createCoupon(createCouponDto);

      expect(prisma.coupon.create).toHaveBeenCalledWith({
        data: createCouponDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCoupons', () => {
    it('should return a list of coupons', async () => {
      const mockResponse = [
        { id: '1', code: 'TEST10', discount: 10 },
        { id: '2', code: 'TEST20', discount: 20 },
      ];
      mockPrismaService.coupon.findMany.mockResolvedValue(mockResponse);

      const result = await service.getCoupons();

      expect(prisma.coupon.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCouponByCode', () => {
    it('should return a coupon by code', async () => {
      const mockResponse = { id: '1', code: 'TEST10', discount: 10 };
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockResponse);

      const result = await service.getCouponByCode('TEST10');

      expect(prisma.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'TEST10' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if coupon is not found', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);

      await expect(service.getCouponByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCoupon', () => {
    it('should update a coupon successfully', async () => {
      const updateCouponDto: UpdateCouponDto = { discount: 15 };
      const mockResponse = { id: '1', code: 'TEST10', discount: 15 };
      mockPrismaService.coupon.update.mockResolvedValue(mockResponse);

      const result = await service.updateCoupon('1', updateCouponDto);

      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateCouponDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteCoupon', () => {
    it('should delete a coupon successfully', async () => {
      const mockResponse = { id: '1', code: 'TEST10', discount: 10 };
      mockPrismaService.coupon.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteCoupon('1');

      expect(prisma.coupon.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateCoupon', () => {
    it('should validate an active and non-expired coupon successfully', async () => {
      const mockResponse = {
        id: '1',
        code: 'TEST10',
        discount: 10,
        isActive: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Valid for 1 hour from now
        createdAt: new Date(), // Add this property
        updatedAt: new Date(), // Add this property
      };
      jest.spyOn(service, 'getCouponByCode').mockResolvedValue(mockResponse);

      const result = await service.validateCoupon('TEST10');

      expect(service.getCouponByCode).toHaveBeenCalledWith('TEST10');
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if coupon is inactive', async () => {
      const mockResponse = {
        id: '1',
        code: 'TEST10',
        discount: 10,
        isActive: false,
        expiresAt: null,
        createdAt: new Date(), // Add this property
        updatedAt: new Date(), // Add this property
      };
      jest.spyOn(service, 'getCouponByCode').mockResolvedValue(mockResponse);

      await expect(service.validateCoupon('TEST10')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if coupon is expired', async () => {
      const mockResponse = {
        id: '1',
        code: 'TEST10',
        discount: 10,
        isActive: true,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
        createdAt: new Date(), // Add this property
        updatedAt: new Date(), // Add this property
      };
      jest.spyOn(service, 'getCouponByCode').mockResolvedValue(mockResponse);

      await expect(service.validateCoupon('TEST10')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
