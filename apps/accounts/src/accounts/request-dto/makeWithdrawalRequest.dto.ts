import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsBigInt, PositiveBigInt } from 'class-validator-extended';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

export class Details {
  @IsString()
  countryCode: string;

  @IsString()
  iban: string;

  @IsString()
  bic: string;

  @IsString()
  bankName: string;

  @IsString()
  recipientName: string;

  @IsString()
  purposeOfPayment: string;
}

export class MakeWithdrawalRequestDto {
  @IsPositive()
  @IsInt()
  accountId: number;

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

  @Type(() => Details)
  @ValidateNested()
  details: Details;
}
