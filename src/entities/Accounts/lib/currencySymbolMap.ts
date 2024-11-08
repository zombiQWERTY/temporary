import { CurrencyCodes } from '@/shared/commonProjectParts';

export const currencySymbolMap: Record<CurrencyCodes, string> = {
  EUR: '€',
  RUB: '₽',
  USD: '$',
  JPY: '¥',
} as const;
