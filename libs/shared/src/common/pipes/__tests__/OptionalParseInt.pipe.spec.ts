import { OptionalParseIntPipe } from '../OptionalParseInt.pipe';
import { BadRequestException } from '@nestjs/common';

describe('OptionalParseIntPipe', () => {
  let pipe: OptionalParseIntPipe;

  beforeEach(() => {
    pipe = new OptionalParseIntPipe();
  });

  it('should return null if value is null', () => {
    const result = pipe.transform(null);
    expect(result).toBeNull();
  });

  it('should return null if value is undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBeNull();
  });

  it('should throw BadRequestException if value is not a numeric string', () => {
    expect(() => pipe.transform('abc')).toThrow(BadRequestException);
  });

  it('should return number if value is a valid numeric string', () => {
    const result = pipe.transform('123');
    expect(result).toBe(123);
  });

  it('should throw BadRequestException if value is a decimal string', () => {
    expect(() => pipe.transform('123.45')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if value is a negative numeric string', () => {
    const result = pipe.transform('-123');
    expect(result).toBe(-123);
  });
});
