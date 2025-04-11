import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Mocking the $connect and $disconnect methods of PrismaClient
    service.$connect = jest.fn();
    service.$disconnect = jest.fn();

    // Mocking console.log and console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to the database successfully', async () => {
      await service.onModuleInit();

      expect(service.$connect).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Conecting to the database...');
      expect(console.log).toHaveBeenCalledWith(
        'Connection established successfully',
      );
    });

    it('should handle errors during database connection', async () => {
      const mockError = new Error('Connection failed');
      service.$connect = jest.fn().mockRejectedValue(mockError);

      await expect(service.onModuleInit()).rejects.toThrow(mockError);

      expect(service.$connect).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'Error to connect to the database:',
        mockError,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database successfully', async () => {
      await service.onModuleDestroy();

      expect(service.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
