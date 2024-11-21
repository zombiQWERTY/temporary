import { Test, TestingModule } from '@nestjs/testing';
import * as sharp from 'sharp';
import axios from 'axios';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ConfigType } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { expect } from 'expect';

import { FilesService } from '../files.service';
import { minioConfig } from '../../config/minio.config';
import { PrismaService } from '../../services/prisma.service';
import { MinioService } from 'nestjs-minio-client';
import { appConfig } from '../../config/app.config';

jest.mock('axios');
jest.mock('sharp');
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

jest.mock('../../config/multer.options', () => ({
  s3: {
    send: () => {},
  },
  makeKey: () => 'file.jpg',
}));

const mockMinioConfig: ConfigType<typeof minioConfig> = {
  bucketName: 'test-bucket',
  accessKey: 'secret',
  secretKey: 'secret',
  publicUrl: 'https://google.com',
};

const mockAppConfig: ConfigType<typeof appConfig> = {
  node_env: 'test',
};

jest.mock('../../config/minio.config', () => ({
  minioConfig: {
    KEY: 'SECRET_KEY',
    default: jest.fn().mockImplementation(() => mockMinioConfig),
  },
}));

describe('FilesService', () => {
  let service: FilesService;
  let prismaMock: DeepMockProxy<PrismaService>;
  let minioMock: DeepMockProxy<MinioService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    minioMock = mockDeep<MinioService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MinioService,
          useValue: minioMock,
        },
        {
          provide: minioConfig.KEY,
          useValue: mockMinioConfig,
        },
        {
          provide: appConfig.KEY,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);

    (axios.get as jest.Mock).mockResolvedValue({
      data: Buffer.from('file data'),
    });

    (sharp as unknown as jest.Mock).mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('thumbnail data')),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('putFiles', () => {
    it('should handle file uploads and store metadata in the database', async () => {
      const files = [
        {
          location: 'http://example.com/file.jpg',
          originalname: 'file.jpg',
          key: 'uploads/1/file.jpg',
          size: 1024,
          mimetype: 'image/jpeg',
          etag: '12345',
        } as Express.MulterS3.File,
      ];
      const tags = ['tag1', 'tag2'];

      prismaMock.$transaction.mockResolvedValue([
        {
          url: files[0].location,
          thumbnailUrl: 'http://example.com/thumbnail.jpg',
          id: 1,
        },
      ]);

      const result = await service.putFiles({ userId: 1, tags, files });

      expect(result).toEqual([
        {
          url: files[0].location,
          thumbnailUrl: 'http://example.com/thumbnail.jpg',
          id: 1,
        },
      ]);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('uploadThumbnail', () => {
    it('should process and upload a thumbnail image', async () => {
      const file = {
        location: 'https://google.com/file.jpg',
        mimetype: 'image/jpeg',
        bucket: 'test-bucket',
        key: 'file.jpg',
      } as Express.MulterS3.File;

      const thumbnailUrl = await service.uploadThumbnail(1, file);

      expect(thumbnailUrl).toContain(
        `https://google.com/${file.bucket}/${file.key}`,
      );
    });
  });

  describe('downloadFileToBuffer', () => {
    it('should download a file and return it as a buffer', async () => {
      const buffer = await service.downloadFileToBuffer(
        'http://example.com/file.jpg',
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(axios.get).toHaveBeenCalledWith('http://example.com/file.jpg', {
        responseType: 'arraybuffer',
      });
    });
  });
});
