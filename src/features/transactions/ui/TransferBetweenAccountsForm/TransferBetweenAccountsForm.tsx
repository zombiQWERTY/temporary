'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useShowConfirmPinFormModal } from '@/features/confirmations';
import { useTransactionForm } from '@/features/transactions';
import { useGetMyAccounts } from '@/entities/Accounts';
import { OtpTypeEnum } from '@/entities/Alerts';
import { MakeTransferBetweenAccountsRequestApi } from '@/entities/Transactions';
import { ServerError } from '@/shared/api';
import { CurrencyCodes, CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { amountTransformer, useToast } from '@/shared/lib';
import { SelectField } from '@/shared/ui';
import {
  CurrencyAmountField,
  currencyAmountFieldSuperRefine,
} from '../CurrencyAmountField';

const TransferBetweenAccountsFormSchema =
  MakeTransferBetweenAccountsRequestApi.MakeTransferBetweenAccountsRequestArgsSchema.omit(
    { code: true },
  );

type TransferBetweenAccountsFormSchema = z.infer<
  typeof TransferBetweenAccountsFormSchema
>;

const defaultValues: TransferBetweenAccountsFormSchema = {
  fromAccountId: '' as unknown as number,
  targetAccountId: '' as unknown as number,
  currency: CurrencyCodesEnum.USD,
  amount: '' as unknown as number,
};

const dataMappers = {
  fromForm: (
    data: TransferBetweenAccountsFormSchema,
    code: string,
  ): MakeTransferBetweenAccountsRequestApi.MakeTransferBetweenAccountsRequestArgsSchema => ({
    ...data,
    amount: amountTransformer.toCents(data.amount),
    code,
  }),
};

export const TransferBetweenAccountsForm = () => {
  const toast = useToast();
  const t = useTranslations('Features.Transactions.Forms.Common');

  const { response: accounts } = useGetMyAccounts();

  const form = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(
      TransferBetweenAccountsFormSchema.superRefine((values, context) =>
        currencyAmountFieldSuperRefine({
          t,
          accounts,
          context,
          values: {
            currency: values.currency,
            fromAccountId: values.fromAccountId,
            amount: values.amount,
          },
        }),
      ),
    ),
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, isValid },
    watch,
    reset,
    getValues,
    setValue,
  } = form;

  const selectedAccount = watch('fromAccountId');
  const targetAccount = watch('targetAccountId');
  const selectedCurrency = watch('currency');

  const { selectedSubAccounts, selectedSubAccount, accountOptions } =
    useTransactionForm({
      accounts,
      selectedCurrency: selectedCurrency as CurrencyCodesEnum,
      selectedAccount,
    });

  useEffect(() => {
    if (selectedAccount === targetAccount) {
      setValue('targetAccountId', defaultValues.targetAccountId);
      setValue('fromAccountId', defaultValues.fromAccountId);
    }
  }, [setValue, selectedAccount, targetAccount]);

  const onCodeSubmit = async (code: string) => {
    try {
      const data = getValues();
      await MakeTransferBetweenAccountsRequestApi.request(
        dataMappers.fromForm(data, code),
      );

      toast.success(t('request_has_been_sent'));
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
                label={t('select_from_account')}
                options={accountOptions}
                fullWidth
              />
              <SelectField
                name="targetAccountId"
                disabled={!selectedAccount}
                label={t('select_to_account')}
                options={accountOptions}
                fullWidth
              />

              <CurrencyAmountField
                baseFieldName="amount"
                innerFieldName="currency"
                label={t('amount')}
                disabled={!selectedAccount || !targetAccount}
                selectedSubAccounts={selectedSubAccounts}
                availableAmount={selectedSubAccount?.balance}
                selectedCurrency={selectedCurrency as CurrencyCodes}
              />

              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isDirty && !isValid}
                loading={isSubmitting}
              >
                {t('transfer')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};
