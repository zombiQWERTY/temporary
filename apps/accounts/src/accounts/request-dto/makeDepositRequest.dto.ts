import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBigInt, PositiveBigInt } from 'class-validator-extended';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

export class MakeDepositRequestDto {
  @IsPositive()
  @IsInt()
  accountId: number;

  @IsEnum(DefaultCurrenciesEnum)
  currency: DefaultCurrenciesEnum;

  @IsBigInt()
  @PositiveBigInt()
  @Transform((val) => BigInt(val.value))
  amount: bigint;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsInt({ each: true })
  @IsOptional()
  fileIds?: number[];
}
