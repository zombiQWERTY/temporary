import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from '../document.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { promises as fs } from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

jest.mock('pizzip');
jest.mock('docxtemplater');

describe('DocumentService', () => {
  let service: DocumentService;
  let fsMock: DeepMockProxy<typeof fs>;
  let PizZipMock: jest.Mock;
  let DocxtemplaterMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentService],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    fsMock = mockDeep<typeof fs>();
    PizZipMock = PizZip as unknown as jest.Mock;
    DocxtemplaterMock = Docxtemplater as unknown as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDocx', () => {
    it('should generate docx and metadata', async () => {
      const assetName = 'template';
      const fileName = 'generatedFile';
      const data = { name: 'John Doe' };

      const mockBuffer = Buffer.from('mock buffer');

      (fsMock.readFile as jest.Mock).mockResolvedValueOnce('mock content');
      PizZipMock.mockImplementation(() => ({
        load: jest.fn(),
        generate: jest.fn().mockReturnValue(mockBuffer),
      }));
      DocxtemplaterMock.mockImplementation(() => ({
        render: jest.fn(),
        getZip: jest.fn().mockReturnValue({
          generate: jest.fn().mockReturnValue(mockBuffer),
        }),
      }));

      const result = await service.generateDocx(assetName, fileName, data);

      expect(Docxtemplater).toHaveBeenCalledWith(expect.any(Object), {
        linebreaks: true,
        paragraphLoop: true,
      });
      expect(result.filledDocxBuffer).toEqual(mockBuffer);
      expect(result.fileMetadata).toEqual({
        originalname: `${fileName}`,
        etag: expect.any(String),
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    });
  });

  describe('generateFileMetadata', () => {
    it('should generate file metadata', () => {
      const fileName = 'generatedFile';
      const buffer = Buffer.from('mock buffer');

      const result = service['generateFileMetadata'](fileName, buffer);

      expect(result).toEqual({
        originalname: `${fileName}`,
        etag: expect.any(String),
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    });
  });

  describe('fillDocxVariablesFs', () => {
    it('should fill docx variables from filesystem', async () => {
      const file = 'path/to/file';
      const values = { name: 'John Doe' };
      const content = 'mock content';
      const mockBuffer = Buffer.from('mock buffer');

      (fsMock.readFile as jest.Mock).mockResolvedValueOnce(content);
      jest
        .spyOn(service, 'fillDocxVariables')
        .mockResolvedValueOnce(mockBuffer);

      const result = await service['fillDocxVariablesFs'](file, values);

      expect(result).toEqual(mockBuffer);
    });
  });

  describe('fillDocxVariables', () => {
    it('should fill docx variables', async () => {
      const content = 'mock content';
      const values = { name: 'John Doe' };
      const mockBuffer = Buffer.from('mock buffer');

      PizZipMock.mockImplementation(() => ({
        load: jest.fn(),
        generate: jest.fn().mockReturnValue(mockBuffer),
      }));
      DocxtemplaterMock.mockImplementation(() => ({
        render: jest.fn(),
        getZip: jest.fn().mockReturnValue({
          generate: jest.fn().mockReturnValue(mockBuffer),
        }),
      }));

      const result = await service['fillDocxVariables'](content, values);

      expect(PizZip).toHaveBeenCalledWith(content);
      expect(result).toEqual(mockBuffer);
    });
  });
});
