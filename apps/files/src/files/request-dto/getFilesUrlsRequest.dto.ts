import { IsArray, IsString } from 'class-validator';

export class GetFilesUrlsRequestDto {
  @IsArray()
  @IsString({ each: true })
  fileIds: number[];
}
