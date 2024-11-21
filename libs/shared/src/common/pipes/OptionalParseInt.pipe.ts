import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class OptionalParseIntPipe
  implements PipeTransform<string, number | null>
{
  transform(value: string | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const val = parseInt(value, 10);
    if (isNaN(val) || value.includes('.')) {
      throw new BadRequestException(
        `Validation failed (numeric string is expected)`,
      );
    }
    return val;
  }
}
