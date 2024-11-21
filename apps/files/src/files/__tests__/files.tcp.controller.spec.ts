import { Test } from '@nestjs/testing';
import { FilesTcpController } from '../files.tcp.controller';
import { FilesService } from '../files.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConfigType } from '@nestjs/config';
import { minioConfig } from '../../config/minio.config';

jest.mock('../files.service');
jest.mock('../../config/multer.options', () => ({
  getMulterOptions: jest.fn(() => ({
    /* Mocked multer options */
  })),
}));

const mockMinioConfig: ConfigType<typeof minioConfig> = {
  bucketName: 'test-bucket',
  accessKey: 'secret',
  secretKey: 'secret',
  publicUrl: 'https://google.com',
};

jest.mock('../../config/minio.config', () => ({
  minioConfig: {
    KEY: 'SECRET_KEY',
    default: jest.fn().mockImplementation(() => mockMinioConfig),
  },
}));

describe('FilesTcpController', () => {
  let controller: FilesTcpController;
  let filesService: DeepMockProxy<FilesService>;

  beforeEach(async () => {
    filesService = mockDeep<FilesService>();

    const moduleRef = await Test.createTestingModule({
      controllers: [FilesTcpController],
      providers: [
        {
          provide: FilesService,
          useValue: filesService,
        },
      ],
    }).compile();

    controller = moduleRef.get<FilesTcpController>(FilesTcpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
