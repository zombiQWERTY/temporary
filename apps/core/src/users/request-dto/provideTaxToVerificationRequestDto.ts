import { IsInt } from 'class-validator';
import { Tax } from './common/taxRequest.dto';

export class ProvideTaxToVerificationRequestDto extends Tax {
  @IsInt({ each: true })
  // @ArrayNotEmpty()
  fileIds: number[];
}
