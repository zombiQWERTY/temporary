'use client';

import fx from 'money';
import { useEffect, useMemo } from 'react';
import { useGetRates } from '@/entities/Rates';

const updateFxRates = (rates: Record<string, number>) => {
  fx.base = 'USD';
  fx.rates = rates;
};

interface UseFetchExchangeRatesProps {
  fromCurrency: string;
  toCurrency: string;
  amount: number | string;
  setValue: (v: number) => void;
}

export const useFetchExchangeRates = ({
  fromCurrency,
  toCurrency,
  amount,
  setValue,
}: UseFetchExchangeRatesProps) => {
  const { response: rates, isFetched } = useGetRates();

  if (isFetched) {
    updateFxRates(rates);
  }

  const convertedValue = useMemo(() => {
    const val = typeof amount === 'string' ? parseInt(amount, 10) : amount;

    return val && fx.base
      ? fx.convert(amount, {
          from: fromCurrency,
          to: toCurrency,
        })
      : 0;
  }, [amount, fromCurrency, toCurrency]);

  const rateValue = useMemo(() => {
    return fx.base && fromCurrency && toCurrency
      ? fx.convert(1, {
          from: fromCurrency,
          to: toCurrency,
        })
      : null;
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    setValue(convertedValue);
  }, [setValue, convertedValue]);

  return { convertedValue, rateValue };
};
