'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useShowConfirmPinFormModal } from '@/features/confirmations';
import { useTransactionForm } from '@/features/transactions';
import { useGetMyAccounts } from '@/entities/Accounts';
import { OtpTypeEnum } from '@/entities/Alerts';
import { MakeP2PTransferRequestApi } from '@/entities/Transactions';
import { ServerError } from '@/shared/api';
import { CurrencyCodes, CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { amountTransformer, useToast } from '@/shared/lib';
import { InputMaskField, SelectField } from '@/shared/ui';
import {
  CurrencyAmountField,
  currencyAmountFieldSuperRefine,
} from '../CurrencyAmountField';

const P2PTransferFormSchema =
  MakeP2PTransferRequestApi.MakeP2PTransferRequestArgsSchema.omit({
    code: true,
  });

type P2PTransferFormSchema = z.infer<typeof P2PTransferFormSchema>;

const defaultValues: P2PTransferFormSchema = {
  fromAccountId: '' as unknown as number,
  targetAccountId: '',
  currency: CurrencyCodesEnum.USD,
  amount: '' as unknown as number,
};

const dataMappers = {
  fromForm: (
    data: P2PTransferFormSchema,
    code: string,
  ): MakeP2PTransferRequestApi.MakeP2PTransferRequestArgsSchema => ({
    ...data,
    amount: amountTransformer.toCents(data.amount),
    code,
  }),
};

export const P2PTransferForm = () => {
  const toast = useToast();
  const t = useTranslations('Features.Transactions.Forms.Common');

  const { response: accounts } = useGetMyAccounts();

  const form = useForm({
    mode: 'all',
    defaultValues,
    resolver: zodResolver(
      P2PTransferFormSchema.superRefine((values, context) =>
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
    formState: { isDirty, isSubmitting },
    watch,
    reset,
    getValues,
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

  const onCodeSubmit = async (code: string) => {
    try {
      const data = getValues();
      await MakeP2PTransferRequestApi.request(dataMappers.fromForm(data, code));

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
              <InputMaskField
                name="targetAccountId"
                label={t('select_to_account')}
                disabled={!selectedAccount}
                mask={['M9999999']}
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
                disabled={!isDirty}
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
