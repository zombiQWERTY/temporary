import { Test, TestingModule } from '@nestjs/testing';
import { FilesRestController } from '../files.rest.controller';
import { FilesService } from '../files.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { RoleEnum } from '@erp-modul/shared';
import { ConfigType } from '@nestjs/config';
import { minioConfig } from '../../config/minio.config';

jest.mock('../files.service');
jest.mock('../../config/multer.options', () => ({
  getMulterOptions: jest.fn(() => ({
    /* Mocked multer options */
  })),
}));

const mockAwsConfig: ConfigType<typeof minioConfig> = {
  bucketName: 'test-bucket',
  accessKey: 'secret',
  secretKey: 'secret',
};

jest.mock('../../config/minio.config', () => ({
  minioConfig: {
    KEY: 'SECRET_KEY',
    default: jest.fn().mockImplementation(() => mockAwsConfig),
  },
}));

const mockMinioConfig: ConfigType<typeof minioConfig> = {
  bucketName: 'test-bucket',
  accessKey: 'secret',
  secretKey: 'secret',
  port: 80,
  publicUrl: 'https://google.com',
};

describe('FilesRestController', () => {
  let controller: FilesRestController;
  let filesServiceMock: DeepMockProxy<FilesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesRestController],
      providers: [
        {
          provide: FilesService,
          useValue: mockDeep<FilesService>(),
        },
        {
          provide: minioConfig.KEY,
          useValue: mockMinioConfig,
        },
      ],
    }).compile();

    controller = module.get<FilesRestController>(FilesRestController);
    filesServiceMock = module.get(FilesService);
  });

  describe('uploadMultipleFiles', () => {
    it('should successfully upload multiple files and return the results', async () => {
      const mockFiles = [
        {
          location: 'https://example.com:80/file1.pdf',
          originalname: 'file1.pdf',
          size: 1,
        },
        {
          location: 'https://example.com:80/file2.jpg',
          originalname: 'file2.jpg',
          size: 1,
        },
      ];
      const mockMeta = {
        userId: 1,
        authId: 1,
        branchId: 1,
        role: RoleEnum.Admin,
      };
      const mockDto = { tags: ['tag1', 'tag2'] };
      const expectedServiceResult = mockFiles.map((file) => ({
        url: file.location,
        thumbnailUrl: 'http://example.com/thumbnail.jpg',
        id: 1,
      }));

      const expectedResult = {
        files: expectedServiceResult,
        fileIds: expectedServiceResult.map((f) => f.id),
      };

      filesServiceMock.putFiles.mockResolvedValue(expectedServiceResult);

      const result = await controller.putFiles(
        mockDto,
        mockMeta,
        mockFiles as Express.MulterS3.File[],
      );

      expect(result).toEqual(expectedResult);
      expect(filesServiceMock.putFiles).toHaveBeenCalledWith({
        userId: mockMeta.userId,
        tags: mockDto.tags,
        files: mockFiles,
      });
    });
  });
});
