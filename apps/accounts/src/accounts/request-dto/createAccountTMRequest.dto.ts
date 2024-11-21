import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

export class CreateAccountTMRequestDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  strategyId: number;

  @IsEnum(DefaultCurrenciesEnum)
  mainCurrency: DefaultCurrenciesEnum;
}
