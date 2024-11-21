import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBigInt, PositiveBigInt } from 'class-validator-extended';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

export class MakeInvestTMTransferRequestDto {
  @IsPositive()
  @IsInt()
  strategyId: number;

  @IsPositive()
  @IsInt()
  @IsOptional()
  userId?: number;

  @IsBigInt()
  @PositiveBigInt()
  @Transform((val) => BigInt(val.value))
  amount: bigint;

  @IsEnum(DefaultCurrenciesEnum)
  currency: DefaultCurrenciesEnum;

  @Length(6, 6)
  @IsOptional()
  code: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
