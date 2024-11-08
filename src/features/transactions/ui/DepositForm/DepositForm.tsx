'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { useTransactionForm } from '@/features/transactions';
import { useGetMyAccounts } from '@/entities/Accounts';
import { MakeDepositRequestApi } from '@/entities/Transactions';
import { ServerError } from '@/shared/api';
import { CurrencyCodes, CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { amountTransformer, useToast } from '@/shared/lib';
import { DialogProps, SelectField } from '@/shared/ui';
import { CurrencyAmountField } from '../CurrencyAmountField';

const defaultValues: MakeDepositRequestApi.MakeDepositRequestArgsSchema = {
  accountId: '' as unknown as number,
  currency: CurrencyCodesEnum.USD,
  amount: '' as unknown as number,
};

const dataMappers = {
  fromForm: (
    data: MakeDepositRequestApi.MakeDepositRequestArgsSchema,
  ): MakeDepositRequestApi.MakeDepositRequestArgsSchema => ({
    ...data,
    amount: amountTransformer.toCents(data.amount),
  }),
};

interface ExternalDepositFormProps {
  closeModal: DialogProps['onClose'];
}

export const DepositForm = ({ closeModal }: ExternalDepositFormProps) => {
  const toast = useToast();
  const t = useTranslations('Features.Transactions.Forms.Common');

  const { response: accounts } = useGetMyAccounts();

  const form = useForm<MakeDepositRequestApi.MakeDepositRequestArgsSchema>({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(MakeDepositRequestApi.MakeDepositRequestArgsSchema),
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    watch,
    reset,
  } = form;

  const selectedAccount = watch('accountId');
  const selectedCurrency = watch('currency');

  const { selectedSubAccounts, selectedSubAccount, accountOptions } =
    useTransactionForm({
      accounts,
      selectedCurrency: selectedCurrency as CurrencyCodesEnum,
      selectedAccount,
    });

  const onSubmit = async (
    data: MakeDepositRequestApi.MakeDepositRequestArgsSchema,
  ) => {
    try {
      await MakeDepositRequestApi.request(dataMappers.fromForm(data));

      toast.success(t('request_has_been_sent'));
      reset(defaultValues);
      closeModal?.({}, 'backdropClick');
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Stack direction="column" gap={6}>
              <SelectField
                name="accountId"
                label={t('select_account')}
                options={accountOptions}
                fullWidth
              />

              <CurrencyAmountField
                baseFieldName="amount"
                innerFieldName="currency"
                label={t('amount')}
                disabled={!selectedAccount}
                selectedSubAccounts={selectedSubAccounts}
                availableAmount={selectedSubAccount?.balance}
                selectedCurrency={selectedCurrency as CurrencyCodes}
                hints={false}
              />

              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isDirty}
                loading={isSubmitting}
              >
                {t('create_request')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};
