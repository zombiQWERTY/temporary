import { IsInt, IsOptional, IsPositive, Length } from 'class-validator';

export class MakeWithdrawTMTransferRequestDto {
  @IsPositive()
  @IsInt()
  investmentId: number;

  @IsPositive()
  @IsInt()
  sharesAmount: number;

  @IsPositive()
  @IsInt()
  @IsOptional()
  userId?: number;

  @Length(6, 6)
  @IsOptional()
  code: string;
}
