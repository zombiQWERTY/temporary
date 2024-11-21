import { IsInt } from 'class-validator';
import { Economic } from './common/economicRequest.dto';

export class ProvideEconomicToVerificationRequestDto extends Economic {
  @IsInt({ each: true })
  // @ArrayNotEmpty()
  fileIds: number[];
}
