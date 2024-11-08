import currency from 'currency.js';
import { currencySymbolMap } from '@/entities/Accounts';
import { CurrencyCodes } from '@/shared/commonProjectParts';

interface FormatMoneyOptions {
  fromCents?: boolean;
  precision?: number;
}

export const formatMoney = (
  value: number | bigint,
  code: CurrencyCodes,
  options: FormatMoneyOptions = { fromCents: true, precision: 2 },
): string => {
  if (!currencySymbolMap[code]) {
    throw new Error(`Unsupported currency code: ${code}`);
  }

  const { fromCents, precision } = options;

  const v = currency(String(value), {
    fromCents,
    symbol: `${currencySymbolMap[code]}\u00A0`,
    decimal: ',',
    separator: '\u00A0',
    precision,
  });

  return v.format();
};
