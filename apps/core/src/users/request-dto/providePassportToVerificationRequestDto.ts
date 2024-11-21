import { IsInt } from 'class-validator';
import { Passport } from './common/passportRequest.dto';

export class ProvidePassportToVerificationRequestDto extends Passport {
  @IsInt({ each: true })
  // @ArrayNotEmpty()
  firstPackFileIds: number[];

  @IsInt({ each: true })
  // @ArrayNotEmpty()
  secondPackFileIds: number[];
}
