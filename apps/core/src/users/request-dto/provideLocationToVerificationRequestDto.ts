import { IsInt } from 'class-validator';
import { Location } from './common/locationRequest.dto';

export class ProvideLocationToVerificationRequestDto extends Location {
  @IsInt({ each: true })
  // @ArrayNotEmpty()
  fileIds: number[];
}
