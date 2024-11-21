import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';
import { IsBigInt, PositiveBigInt } from 'class-validator-extended';
import { Transform } from 'class-transformer';

export class ConfirmTransactionRequestDto {
  @IsPositive()
  @IsInt()
  transactionId: number;

  @IsBigInt()
  @PositiveBigInt()
  @Transform((val) => BigInt(val.value))
  @IsOptional()
  amount?: bigint;

  @IsBoolean()
  isConfirmed: boolean;
}
