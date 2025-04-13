import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { CloudinaryService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { FileResponseDto } from './dto/filre-response.dto';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

describe('FilesController', () => {
  let controller: FilesController;
  let cloudinaryService: CloudinaryService;

  const mockCloudinaryService = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(), // Mock del método "get" de ConfigService
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        originalname: 'test-file.png',
        size: 12345,
        mimetype: 'image/png',
      } as Express.Multer.File;

      const mockPublicId = 'mockPublicId';
      const mockUrl = 'http://mockurl.com/mockPublicId';

      mockCloudinaryService.uploadFile.mockResolvedValue(mockPublicId);
      mockCloudinaryService.getFileUrl.mockResolvedValue(mockUrl);

      const result: FileResponseDto = await controller.uploadFile(mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        fileKey: mockPublicId,
        url: mockUrl,
      });
      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(cloudinaryService.getFileUrl).toHaveBeenCalledWith(mockPublicId);
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(controller.uploadFile(null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw HttpException if an error occurs during upload', async () => {
      const mockFile = {
        originalname: 'test-file.png',
        size: 12345,
        mimetype: 'image/png',
      } as Express.Multer.File;

      mockCloudinaryService.uploadFile.mockRejectedValue(
        new Error('Upload error'),
      );

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        new HttpException(
          'Error uploading file: Upload error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getFile', () => {
    it('should return a file URL successfully', async () => {
      const publicId = 'mockPublicId';
      const mockUrl = 'http://mockurl.com/mockPublicId';

      mockCloudinaryService.getFileUrl.mockResolvedValue(mockUrl);

      const result: FileResponseDto = await controller.getFile(publicId);

      expect(result).toEqual({
        message: 'File URL generated successfully',
        fileKey: publicId,
        url: mockUrl,
      });
      expect(cloudinaryService.getFileUrl).toHaveBeenCalledWith(publicId);
    });

    it('should throw BadRequestException if no publicId is provided', async () => {
      await expect(controller.getFile(null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw HttpException if an error occurs while getting the file URL', async () => {
      const publicId = 'mockPublicId';

      mockCloudinaryService.getFileUrl.mockRejectedValue(
        new Error('URL generation error'),
      );

      await expect(controller.getFile(publicId)).rejects.toThrow(
        new HttpException(
          'Error getting file URL: URL generation error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const publicId = 'mockPublicId';

      mockCloudinaryService.deleteFile.mockResolvedValue(undefined);

      const result: FileResponseDto = await controller.deleteFile(publicId);

      expect(result).toEqual({
        message: 'File deleted successfully',
      });
      expect(cloudinaryService.deleteFile).toHaveBeenCalledWith(publicId);
    });

    it('should throw BadRequestException if no publicId is provided', async () => {
      await expect(controller.deleteFile(null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw HttpException if an error occurs while deleting the file', async () => {
      const publicId = 'mockPublicId';

      mockCloudinaryService.deleteFile.mockRejectedValue(
        new Error('Deletion error'),
      );

      await expect(controller.deleteFile(publicId)).rejects.toThrow(
        new HttpException(
          'Error deleting file: Deletion error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('testEndpoint', () => {
    it('should return a success message', () => {
      const result = controller.testEndpoint();
      expect(result).toEqual({ message: 'Files controller is working!' });
    });
  });
});
