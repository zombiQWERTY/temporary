import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBigInt, PositiveBigInt } from 'class-validator-extended';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

export class MakeP2PTransferRequestDto {
  @IsPositive()
  @IsInt()
  fromAccountId: number;

  @IsString()
  @Matches(/^M.{7}$/, {
    message:
      'targetAccountId must start with "M" followed by exactly 7 characters.',
  })
  targetAccountId: string;

  @IsEnum(DefaultCurrenciesEnum)
  currency: DefaultCurrenciesEnum;

  @IsBigInt()
  @PositiveBigInt()
  @Transform((val) => BigInt(val.value))
  amount: bigint;

  @Length(6, 6)
  @IsOptional()
  code: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
