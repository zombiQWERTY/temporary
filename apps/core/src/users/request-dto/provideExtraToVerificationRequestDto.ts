import { IsInt } from 'class-validator';

export class ProvideExtraToVerificationRequestDto {
  @IsInt({ each: true })
  // @ArrayNotEmpty()
  fileIds: number[];
}
