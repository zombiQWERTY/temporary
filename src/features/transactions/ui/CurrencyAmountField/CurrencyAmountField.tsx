'use client';
import { InputAdornment } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, KeyboardEvent } from 'react';

import {
  currencySymbolMap,
  formatMoney,
  GetMyAccountsApi,
} from '@/entities/Accounts';
import { CurrencyCodes, CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { InputTextField, SelectField } from '@/shared/ui';

interface CurrencyAmountFieldProps {
  label: string;
  baseFieldName: string;
  innerFieldName: string;
  availableAmount?: bigint;
  selectedCurrency?: CurrencyCodes;
  singleCurrency?: CurrencyCodesEnum;
  selectedSubAccounts?: GetMyAccountsApi.SubAccountSchema[];
  disabled?: boolean;
  readOnly?: boolean;
  hints?: boolean;
}

const defaultOptions = [
  CurrencyCodesEnum.USD,
  CurrencyCodesEnum.EUR,
  CurrencyCodesEnum.JPY,
  CurrencyCodesEnum.RUB,
].map((v) => ({ label: v, id: v }));

const preventInvalidKey = (e: KeyboardEvent) => {
  if (['e', 'E', '-', '+'].includes(e.key)) {
    e.preventDefault();
  }
};

export const CurrencyAmountField = ({
  label,
  baseFieldName,
  innerFieldName,
  availableAmount,
  selectedCurrency,
  selectedSubAccounts,
  singleCurrency,
  disabled = false,
  readOnly = false,
  hints = true,
}: CurrencyAmountFieldProps) => {
  const t = useTranslations('Widgets.CurrencyAmountField');

  const options = useMemo(() => {
    return selectedSubAccounts?.length
      ? selectedSubAccounts.map(
          (subAccount: GetMyAccountsApi.SubAccountSchema) => ({
            id: subAccount.currencyCode,
            label: formatMoney(subAccount.balance, subAccount.currencyCode),
          }),
        )
      : defaultOptions;
  }, [selectedSubAccounts]);

  const helperText = useMemo(() => {
    if (availableAmount !== undefined && selectedCurrency && hints) {
      return `${t('available')}: ${formatMoney(availableAmount, selectedCurrency)}`;
    }

    return undefined;
  }, [availableAmount, selectedCurrency, hints, t]);

  return (
    <InputTextField
      name={baseFieldName}
      type="number"
      disabled={disabled}
      label={label}
      inputProps={{ readOnly }}
      onKeyDown={preventInvalidKey}
      formHelperText={helperText}
      endAdornment={
        <InputAdornment position="end">
          <SelectField
            name={innerFieldName}
            disabled={disabled || !!singleCurrency}
            sx={{
              width: '120px',
              boxShadow: 0,
              background: 'none',
              textAlign: 'right',
              '& .MuiSelect-select': {
                paddingRight: '45px !important',
                paddingLeft: '0 !important',
              },
              '&.Mui-focused, & :focus, &:hover, &.Mui-disabled': {
                boxShadow: 'none!important',
                background: 'none',
              },
            }}
            renderValue={(code) => {
              const symbol =
                typeof code === 'string'
                  ? currencySymbolMap[code as CurrencyCodes]
                  : null;
              return `${code}, ${symbol}`;
            }}
            options={options}
          />
        </InputAdornment>
      }
      fullWidth
    />
  );
};
