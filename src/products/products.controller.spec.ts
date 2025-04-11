import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    searchProducts: jest.fn(),
    findByPriceRange: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mock the JwtAuthGuard
      .useValue({ canActivate: jest.fn(() => true) }) // Always allow access
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        image: '',
      };
      const mockResponse = { id: '1', ...createProductDto };

      mockProductsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(mockResponse);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const mockResponse = [
        { id: '1', name: 'Product 1', price: 50 },
        { id: '2', name: 'Product 2', price: 100 },
      ];

      mockProductsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll();

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('searchProducts', () => {
    it('should return search results for a given term', async () => {
      const searchTerm = 'Test';
      const mockResponse = [{ id: '1', name: 'Test Product', price: 100 }];

      mockProductsService.searchProducts.mockResolvedValue(mockResponse);

      const result = await controller.searchProducts(searchTerm);

      expect(result).toEqual(mockResponse);
      expect(service.searchProducts).toHaveBeenCalledWith(searchTerm);
    });
  });

  describe('findByPriceRange', () => {
    it('should return products within the specified price range', async () => {
      const minPrice = 50;
      const maxPrice = 150;
      const mockResponse = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 120 },
      ];

      mockProductsService.findByPriceRange.mockResolvedValue(mockResponse);

      const result = await controller.findByPriceRange(minPrice, maxPrice);

      expect(result).toEqual(mockResponse);
      expect(service.findByPriceRange).toHaveBeenCalledWith(minPrice, maxPrice);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const id = '1';
      const mockResponse = { id: '1', name: 'Test Product', price: 100 };

      mockProductsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockResponse);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a product by ID', async () => {
      const id = '1';
      const updateProductDto: UpdateProductDto = { price: 150 };
      const mockResponse = { id: '1', name: 'Test Product', price: 150 };

      mockProductsService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(id, updateProductDto);

      expect(result).toEqual(mockResponse);
      expect(service.update).toHaveBeenCalledWith(id, updateProductDto);
    });
  });

  describe('remove', () => {
    it('should remove a product by ID', async () => {
      const id = '1';
      const mockResponse = { success: true };

      mockProductsService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(id);

      expect(result).toEqual(mockResponse);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
