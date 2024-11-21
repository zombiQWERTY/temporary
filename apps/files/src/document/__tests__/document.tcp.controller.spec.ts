import { Test } from '@nestjs/testing';
import { DocumentTcpController } from '../document.tcp.controller';
import { DocumentService } from '../document.service';
import { FilesService } from '../../files/files.service';
import { MakeDocumentRequestDto } from '../request-dto/makeDocumentRequest.dto';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConfigType } from '@nestjs/config';
import { minioConfig } from '../../config/minio.config';

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

jest.mock('../../config/minio.config', () => ({
  minioConfig: {
    KEY: 'SECRET_KEY',
    default: jest.fn().mockImplementation(() => mockMinioConfig),
  },
}));

describe('DocumentTcpController', () => {
  let controller: DocumentTcpController;
  let filesService: DeepMockProxy<FilesService>;
  let documentService: DeepMockProxy<DocumentService>;

  beforeEach(async () => {
    filesService = mockDeep<FilesService>();
    documentService = mockDeep<DocumentService>();

    const moduleRef = await Test.createTestingModule({
      controllers: [DocumentTcpController],
      providers: [
        { provide: FilesService, useValue: filesService },
        { provide: DocumentService, useValue: documentService },
      ],
    }).compile();

    controller = moduleRef.get<DocumentTcpController>(DocumentTcpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call DocumentService and FilesService correctly', async () => {
    const dto: MakeDocumentRequestDto = {
      assetName: 'testAsset',
      fileName: 'testFile',
      data: { key: 'value' },
      userId: 1,
    };

    const filledDocxBuffer = Buffer.from('file content');
    const fileMetadata = {
      originalname: 'testFile.docx',
      etag: 'etag',
      mimetype:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const url = 'http://example.com/file';

    documentService.generateDocx.mockResolvedValue({
      filledDocxBuffer,
      fileMetadata,
    });
    filesService.uploadBuffer.mockResolvedValue(url);
    filesService.prepareRaw.mockReturnValue({
      mimeType: '',
      name: '',
      path: '',
      size: 0,
      userId: 1,
      url,
    });
    filesService.saveRaw.mockResolvedValue({ id: 1, url });

    const result = await controller.makeDocument(dto);

    expect(documentService.generateDocx).toHaveBeenCalledWith(
      'testAsset',
      'testFile',
      { key: 'value' },
    );
    expect(filesService.uploadBuffer).toHaveBeenCalledWith(
      'file.jpg',
      filledDocxBuffer,
      fileMetadata.mimetype,
    );
    expect(filesService.prepareRaw).toHaveBeenCalledWith({
      file: fileMetadata,
      folder: 'documents',
      tags: ['document', '1', 'testAsset'],
      buffer: filledDocxBuffer,
      userId: 1,
      url,
    });
    expect(filesService.saveRaw).toHaveBeenCalledWith({
      userId: 1,
      url,
      mimeType: '',
      name: '',
      path: '',
      size: 0,
    });
    expect(result).toEqual({ id: 1, url });
  });
});
