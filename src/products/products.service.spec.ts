import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { CloudinaryService } from '../files/files.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: '',
        image: '',
        price: 0,
      };
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: 'Test Product',
        description: '',
        price: 0,
        image: '',
      });

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Product',
          description: '',
          image: '',
          price: 0,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', image: null },
        { id: '2', name: 'Product 2', image: 'image_url' },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual([
        { id: '1', name: 'Product 1', image: '' },
        { id: '2', name: 'Product 2', image: 'image_url' },
      ]);

      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });

    it('should return an empty array if an error occurs', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(new Error('Error'));

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product if it exists', async () => {
      const mockProduct = { id: '1', name: 'Product 1', image: null };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual({ id: '1', name: 'Product 1', image: '' });
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if the product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const mockProduct = { id: '1', name: 'Updated Product', image: '' };
      mockPrismaService.product.update.mockResolvedValue(mockProduct);

      const result = await service.update('1', { name: 'Updated Product' });

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Product', image: '' },
      });
    });

    it('should throw NotFoundException if the product does not exist', async () => {
      mockPrismaService.product.update.mockRejectedValue(new Error('Error'));

      await expect(
        service.update('1', { name: 'Updated Product' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Product', image: '' },
      });
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      const mockProduct = { id: '1', name: 'Product 1', image: 'image_url' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove('1');

      expect(result).toEqual(mockProduct);
      expect(cloudinaryService.deleteFile).toHaveBeenCalledWith('image_url');
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if the product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('searchProducts', () => {
    it('should search products by name or description', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', description: 'Description 1' },
        { id: '2', name: 'Product 2', description: 'Description 2' },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.searchProducts('Product');

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Product' } },
            { description: { contains: 'Product' } },
          ],
        },
      });
    });
  });

  describe('findByPriceRange', () => {
    it('should find products within a price range', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 50 },
        { id: '2', name: 'Product 2', price: 100 },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findByPriceRange(50, 100);

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ price: { gte: 50 } }, { price: { lte: 100 } }],
        },
      });
    });
  });
});
