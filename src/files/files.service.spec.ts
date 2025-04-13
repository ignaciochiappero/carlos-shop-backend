import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

jest.mock('cloudinary');

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let mockConfigService: ConfigService;

  const mockCloudinary = {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
    url: jest.fn(),
  };

  beforeAll(() => {
    jest.spyOn(cloudinary, 'config').mockImplementation(mockCloudinary.config);
    jest
      .spyOn(cloudinary.uploader, 'upload_stream')
      .mockImplementation(mockCloudinary.uploader.upload_stream);
    jest
      .spyOn(cloudinary.uploader, 'destroy')
      .mockImplementation(mockCloudinary.uploader.destroy);
    jest.spyOn(cloudinary, 'url').mockImplementation(mockCloudinary.url);
  });

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'CLOUDINARY_CLOUD_NAME') return 'mock-cloud-name';
        if (key === 'CLOUDINARY_API_KEY') return 'mock-api-key';
        if (key === 'CLOUDINARY_API_SECRET') return 'mock-api-secret';
        return null;
      }),
    } as unknown as ConfigService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        path: 'mock/file/path',
      } as Express.Multer.File;

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1024 } as fs.Stats);
      jest
        .spyOn(fs, 'createReadStream')
        .mockReturnValue({ pipe: jest.fn() } as unknown as fs.ReadStream);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      mockCloudinary.uploader.upload_stream.mockImplementation(
        (options, callback) => {
          callback(null, { public_id: 'mockPublicId' });
          return {} as any;
        },
      );

      const result = await service.uploadFile(mockFile);

      expect(result).toBe('mockPublicId');
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFile.path);
    });

    it('should throw an error if the file does not exist', async () => {
      const mockFile = {
        path: 'mock/file/path',
      } as Express.Multer.File;

      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      await expect(service.uploadFile(mockFile)).rejects.toThrowError(
        'The file does not exist: mock/file/path.',
      );
    });

    it('should handle errors during upload', async () => {
      const mockFile = {
        path: 'mock/file/path',
      } as Express.Multer.File;

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1024 } as fs.Stats);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      mockCloudinary.uploader.upload_stream.mockImplementation(
        (options, callback) => {
          callback(new Error('Upload failed'), null);
          return {} as any;
        },
      );

      await expect(service.uploadFile(mockFile)).rejects.toThrowError(
        'Upload failed',
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const publicId = 'mockPublicId';
      mockCloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

      const result = await service.deleteFile(publicId);

      expect(result).toBe(true);
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('should return false if deletion fails', async () => {
      const publicId = 'mockPublicId';
      mockCloudinary.uploader.destroy.mockResolvedValue({
        result: 'not found',
      });

      const result = await service.deleteFile(publicId);

      expect(result).toBe(false);
    });

    it('should handle errors during deletion', async () => {
      const publicId = 'mockPublicId';
      mockCloudinary.uploader.destroy.mockRejectedValue(
        new Error('Deletion failed'),
      );

      await expect(service.deleteFile(publicId)).rejects.toThrowError(
        'Deletion failed',
      );
    });
  });
});
