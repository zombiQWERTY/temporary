import { IsBoolean, IsOptional } from 'class-validator';
import { IsBigInt, PositiveBigInt } from 'class-validator-extended';
import { Transform } from 'class-transformer';

export class UpdateUserAccountSettingsDto {
  @IsBigInt()
  @PositiveBigInt()
  @Transform((val) => BigInt(val.value))
  @IsOptional()
  limitInUsd?: bigint;

  @IsBoolean()
  @IsOptional()
  accountOperationsBlocked: boolean;
}
