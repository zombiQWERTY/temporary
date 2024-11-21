import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';
import { Transform } from 'class-transformer';

export class AddCurrencyRateDto {
  @IsEnum(DefaultCurrenciesEnum)
  targetCurrencyCode: DefaultCurrenciesEnum;

  @IsNumber(
    { maxDecimalPlaces: 8 },
    { message: 'Value must be a valid number with up to 8 decimal places' },
  )
  @IsPositive({ message: 'Value must be a positive number' })
  @Transform(({ value }) => parseFloat(value))
  value: number;
}
