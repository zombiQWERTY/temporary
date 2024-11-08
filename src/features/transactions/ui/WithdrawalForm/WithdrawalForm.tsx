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
import { MakeWithdrawalRequestApi } from '@/entities/Transactions';
import { ServerError } from '@/shared/api';
import { CurrencyCodes, CurrencyCodesEnum } from '@/shared/commonProjectParts';
import {
  amountTransformer,
  useCountryCodeOptions,
  useToast,
} from '@/shared/lib';
import { InputTextField, SelectField } from '@/shared/ui';
import {
  CurrencyAmountField,
  currencyAmountFieldSuperRefine,
} from '../CurrencyAmountField';

const WithdrawalFormSchema =
  MakeWithdrawalRequestApi.MakeWithdrawalRequestArgsSchema.omit({
    code: true,
  });

type WithdrawalFormSchema = z.infer<typeof WithdrawalFormSchema>;

const defaultValues: WithdrawalFormSchema = {
  accountId: '' as unknown as number,
  currency: CurrencyCodesEnum.USD,
  amount: '' as unknown as number,
  details: {
    bankName: '',
    bic: '',
    iban: '',
    countryCode: '',
    purposeOfPayment: '',
    recipientName: '',
  },
};

const dataMappers = {
  fromForm: (
    data: WithdrawalFormSchema,
    code: string,
  ): MakeWithdrawalRequestApi.MakeWithdrawalRequestArgsSchema => ({
    ...data,
    amount: amountTransformer.toCents(data.amount),
    code,
  }),
};

export const WithdrawalForm = () => {
  const toast = useToast();
  const t = useTranslations('Features.Transactions.Forms');
  const countryOptions = useCountryCodeOptions();

  const { response: accounts } = useGetMyAccounts();

  const form = useForm({
    mode: 'all',
    defaultValues,
    resolver: zodResolver(
      WithdrawalFormSchema.superRefine((values, context) =>
        currencyAmountFieldSuperRefine({
          t,
          accounts,
          context,
          values: {
            currency: values.currency,
            fromAccountId: values.accountId,
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

  const selectedAccount = watch('accountId');
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
      await MakeWithdrawalRequestApi.request(dataMappers.fromForm(data, code));

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
                name="accountId"
                label={t('Common.select_account')}
                options={accountOptions}
                fullWidth
              />

              <CurrencyAmountField
                baseFieldName="amount"
                innerFieldName="currency"
                label={t('Common.amount')}
                disabled={!selectedAccount}
                selectedSubAccounts={selectedSubAccounts}
                availableAmount={selectedSubAccount?.balance}
                selectedCurrency={selectedCurrency as CurrencyCodes}
              />

              <SelectField
                name="details.countryCode"
                label={t('WithdrawalForm.country')}
                options={countryOptions}
                disabled={!selectedAccount}
                fullWidth
              />

              <InputTextField
                name="details.iban"
                label={t('WithdrawalForm.iban')}
                fullWidth
              />
              <InputTextField
                name="details.bic"
                label={t('WithdrawalForm.bic')}
                fullWidth
              />
              <InputTextField
                name="details.bankName"
                label={t('WithdrawalForm.bank_name')}
                fullWidth
              />
              <InputTextField
                name="details.recipientName"
                label={t('WithdrawalForm.recipient_name')}
                fullWidth
              />
              <InputTextField
                name="details.purposeOfPayment"
                label={t('WithdrawalForm.purpose_of_payment')}
                fullWidth
              />

              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isDirty}
                loading={isSubmitting}
              >
                {t('Common.withdraw')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};
