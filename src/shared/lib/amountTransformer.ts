import currency, { Any } from 'currency.js';

const isBigInt = (value: Any | bigint): value is bigint =>
  typeof value === 'bigint';

export const amountTransformer = {
  toCents: (value: Any | bigint): number => {
    const formattedValue = isBigInt(value) ? String(value) : value;
    return currency(formattedValue).multiply(100).value;
  },
  fromCents: (value: Any | bigint): number => {
    const formattedValue = isBigInt(value) ? String(value) : value;
    return currency(formattedValue, { fromCents: true }).value;
  },
};
