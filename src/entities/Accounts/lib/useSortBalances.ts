'use client';
import { useMemo } from 'react';
import { CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { AccountBalanceSchema } from '../api/getMyBalance';

interface UseSortBalancesProps {
  balances: AccountBalanceSchema[];
}

export const useSortBalances = ({ balances }: UseSortBalancesProps) => {
  const balancesMap: AccountBalanceSchema[] = useMemo(() => {
    const map = balances?.reduce<
      Record<CurrencyCodesEnum, AccountBalanceSchema>
    >(
      (acc, i) => ({ ...acc, [i.currencyCode]: i }),
      {} as Record<CurrencyCodesEnum, AccountBalanceSchema>,
    );

    return [
      map[CurrencyCodesEnum.USD] || {
        balance: 0,
        currencyCode: CurrencyCodesEnum.USD,
      },
      map[CurrencyCodesEnum.EUR] || {
        balance: 0,
        currencyCode: CurrencyCodesEnum.EUR,
      },
      map[CurrencyCodesEnum.JPY] || {
        balance: 0,
        currencyCode: CurrencyCodesEnum.JPY,
      },
      map[CurrencyCodesEnum.RUB] || {
        balance: 0,
        currencyCode: CurrencyCodesEnum.RUB,
      },
    ];
  }, [balances]);

  return balancesMap;
};
