'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useShowConfirmPinFormModal } from '@/features/confirmations';
import { useTransactionForm } from '@/features/transactions';
import { formatMoney, useGetMyAccounts } from '@/entities/Accounts';
import { OtpTypeEnum } from '@/entities/Alerts';
import { MakeCurrencyExchangeRequestApi } from '@/entities/Transactions';
import { ServerError } from '@/shared/api';
import { CurrencyCodes, CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { amountTransformer, useToast } from '@/shared/lib';
import { InfoIcon, SelectField } from '@/shared/ui';
import { useFetchExchangeRates } from '../../lib/useFetchExchangeRates';
import {
  CurrencyAmountField,
  currencyAmountFieldSuperRefine,
} from '../CurrencyAmountField';

const CurrencyExchangeFormSchema =
  MakeCurrencyExchangeRequestApi.MakeCurrencyExchangeRequestArgsSchema.omit({
    code: true,
  }).extend({
    resultingAmount: z.number(),
  });

type CurrencyExchangeFormSchema = z.infer<typeof CurrencyExchangeFormSchema>;

const defaultValues: CurrencyExchangeFormSchema = {
  fromAccountId: '' as unknown as number,
  fromCurrency: CurrencyCodesEnum.USD,
  toCurrency: CurrencyCodesEnum.EUR,
  amount: '' as unknown as number,
  resultingAmount: '' as unknown as number,
};

const dataMappers = {
  fromForm: (
    { resultingAmount: _resultingAmount, ...data }: CurrencyExchangeFormSchema,
    code: string,
  ): MakeCurrencyExchangeRequestApi.MakeCurrencyExchangeRequestArgsSchema => ({
    ...data,
    amount: amountTransformer.toCents(data.amount),
    code,
  }),
};

export const CurrencyExchangeForm = () => {
  const toast = useToast();
  const t = useTranslations('Features.Transactions.Forms');

  const { response: accounts } = useGetMyAccounts();

  const form = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(
      CurrencyExchangeFormSchema.superRefine((values, context) =>
        currencyAmountFieldSuperRefine({
          t,
          accounts,
          context,
          values: {
            currency: values.fromCurrency,
            fromAccountId: values.fromAccountId,
            amount: values.amount,
          },
        }),
      ),
    ),
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    watch,
    reset,
    setError,
    clearErrors,
    getValues,
    setValue,
  } = form;

  const selectedAccount = watch('fromAccountId');
  const selectedFromCurrency = watch('fromCurrency');
  const selectedToCurrency = watch('toCurrency');
  const amount = watch('amount');

  const { selectedSubAccounts, selectedSubAccount, accountOptions } =
    useTransactionForm({
      accounts,
      selectedCurrency: selectedFromCurrency as CurrencyCodesEnum,
      selectedAccount,
    });

  const { rateValue } = useFetchExchangeRates({
    amount,
    toCurrency: selectedToCurrency.toLowerCase(),
    fromCurrency: selectedFromCurrency.toLowerCase(),
    setValue: (res: number) => setValue('resultingAmount', res),
  });

  useEffect(() => {
    if (
      amount >
      amountTransformer.fromCents(selectedSubAccount?.balance || BigInt(0))
    ) {
      setError('amount', {
        type: 'max',
        message: t('Common.less_or_equal'),
      });
    } else {
      clearErrors('amount');
    }
  }, [t, amount, selectedSubAccount?.balance, clearErrors, setError]);

  const onCodeSubmit = async (code: string) => {
    try {
      const data = getValues();
      await MakeCurrencyExchangeRequestApi.request(
        dataMappers.fromForm(data, code),
      );

      toast.success(t('Common.request_has_been_sent'));
      reset(defaultValues);
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
    }
  };

  const { showModal } = useShowConfirmPinFormModal({
    eventType: OtpTypeEnum.CONFIRM_TRANSACTION,
    onCodeSubmit,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(showModal)}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={8} lg={6}>
            <Stack direction="column" gap={6}>
              <SelectField
                name="fromAccountId"
                label={t('Common.select_from_account')}
                options={accountOptions}
                fullWidth
              />

              <CurrencyAmountField
                baseFieldName="amount"
                innerFieldName="fromCurrency"
                label={t('CurrencyExchangeForm.you_give')}
                selectedSubAccounts={selectedSubAccounts}
                availableAmount={selectedSubAccount?.balance}
                selectedCurrency={selectedFromCurrency as CurrencyCodes}
                disabled={!selectedAccount}
              />

              <CurrencyAmountField
                baseFieldName="resultingAmount"
                innerFieldName="toCurrency"
                label={t('CurrencyExchangeForm.you_get')}
                selectedCurrency={selectedToCurrency as CurrencyCodes}
                disabled={!selectedAccount}
                readOnly
              />

              {Boolean(
                selectedFromCurrency && selectedToCurrency && rateValue,
              ) && (
                <Typography variant="BodySRegular" color="text.secondary">
                  <Stack direction="row" gap={2} alignItems="center">
                    <InfoIcon fontSize="large" />
                    {t('CurrencyExchangeForm.exchange_rate_info')}&nbsp;
                    {formatMoney(100, selectedFromCurrency as CurrencyCodes)}
                    &nbsp;=&nbsp;
                    {formatMoney(
                      amountTransformer.toCents(rateValue!),
                      selectedToCurrency as CurrencyCodes,
                    )}
                  </Stack>
                </Typography>
              )}

              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isDirty}
                loading={isSubmitting}
              >
                {t('Common.create_request')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};
