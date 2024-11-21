import { HttpException, HttpStatus } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { fileFilter } from '../file.filter';

describe('fileFilter', () => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  const filter = fileFilter(allowedMimeTypes);
  const callback = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should accept a file with an allowed MIME type', () => {
    const file = {
      mimetype: 'image/jpeg',
      originalname: 'test.jpg',
    } as Express.Multer.File;

    filter(mockDeep<Request>(), file, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('should reject a file with a disallowed MIME type', () => {
    const file = {
      mimetype: 'application/pdf',
      originalname: 'test.pdf',
    } as Express.Multer.File;

    filter(mockDeep<Request>(), file, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(HttpException), false);
    expect(callback.mock.calls[0][0].response).toBe(
      `Unsupported file type .pdf`,
    );
    expect(callback.mock.calls[0][0].status).toBe(HttpStatus.BAD_REQUEST);
  });
});
