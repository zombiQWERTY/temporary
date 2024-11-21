import { IsInt, IsObject, IsPositive, IsString } from 'class-validator';

export class MakeDocumentRequestDto {
  @IsString()
  assetName: string;

  @IsString()
  fileName: string;

  @IsObject()
  data: Record<string, string>;

  @IsInt()
  @IsPositive()
  userId: number;
}
