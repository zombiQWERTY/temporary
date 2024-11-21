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

export class MakeInternalChangeRequestDto {
  @IsPositive()
  @IsInt()
  fromAccountId: number;

  @IsEnum(DefaultCurrenciesEnum)
  fromCurrency: DefaultCurrenciesEnum;

  @IsEnum(DefaultCurrenciesEnum)
  toCurrency: DefaultCurrenciesEnum;

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
