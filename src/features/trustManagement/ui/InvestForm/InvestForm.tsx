'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useShowConfirmPinFormModal } from '@/features/confirmations';
import {
  CurrencyAmountField,
  useTransactionForm,
  currencyAmountFieldSuperRefine,
} from '@/features/transactions';
import { useGetMyAccounts } from '@/entities/Accounts';
import { OtpTypeEnum } from '@/entities/Alerts';
import { MakeInvestTMRequestApi } from '@/entities/Transactions';
import { ServerError } from '@/shared/api';
import {
  AccountTypeEnum,
  CurrencyCodes,
  CurrencyCodesEnum,
} from '@/shared/commonProjectParts';
import { amountTransformer, useToast } from '@/shared/lib';
import { Checkbox, DialogProps, SelectField } from '@/shared/ui';

const InvestTMFormSchema =
  MakeInvestTMRequestApi.MakeInvestTMRequestArgsSchema.omit({
    strategyId: true,
    code: true,
  }).extend({
    accountId: z.number(),
  });

type InvestTMFormSchema = z.infer<typeof InvestTMFormSchema>;

const makeDefaultValues = (
  currency: CurrencyCodesEnum,
): InvestTMFormSchema => ({
  accountId: '' as unknown as number,
  currency,
  amount: '' as unknown as number,
});

const dataMappers = {
  fromForm: (
    { accountId: _accountId, ...data }: InvestTMFormSchema,
    code: string,
    strategyId: number,
  ): MakeInvestTMRequestApi.MakeInvestTMRequestArgsSchema => ({
    ...data,
    code,
    strategyId,
    amount: amountTransformer.toCents(data.amount),
  }),
};

interface InvestFormProps {
  closeModal: DialogProps['onClose'];
  strategyId: number;
  strategyCurrency: CurrencyCodesEnum;
}

export const InvestForm = ({
  closeModal,
  strategyId,
  strategyCurrency,
}: InvestFormProps) => {
  const toast = useToast();
  const t = useTranslations('Features.Strategies.Forms.Common');
  const tInvest = useTranslations('Features.Strategies.Forms.Invest');

  const { response: accounts } = useGetMyAccounts();

  const defaultValues = useMemo(
    () => makeDefaultValues(strategyCurrency),
    [strategyCurrency],
  );

  const form = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(
      InvestTMFormSchema.superRefine((values, context) =>
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

  useEffect(() => {
    if (!accounts || !accounts?.list?.length) {
      return;
    }

    const accountId = accounts.list.find(
      (a) => a.accountType === AccountTypeEnum.Master,
    )?.id;

    if (accountId) {
      reset({
        ...defaultValues,
        accountId,
      });
    }
  }, [accounts, reset]);

  const onCodeSubmit = useCallback(
    async (code: string) => {
      try {
        const data = getValues();
        await MakeInvestTMRequestApi.request(
          dataMappers.fromForm(data, code, strategyId),
        );

        toast.success(t('request_has_been_sent'));
        reset(defaultValues);
        closeModal?.({}, 'backdropClick');
      } catch (e: unknown) {
        const { error } = e as ServerError;
        toast.error(error);
      }
    },
    [closeModal, getValues, reset, strategyId, t, toast],
  );

  const { showModal } = useShowConfirmPinFormModal({
    eventType: OtpTypeEnum.CONFIRM_TRANSACTION,
    onCodeSubmit,
  });

  const [agreed, setAgreed] = useState(false);

  const onAgreedChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) =>
    setAgreed(checked);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(showModal)}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Stack direction="column" gap={6}>
              <SelectField
                name="accountId"
                disabled
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
                singleCurrency={strategyCurrency}
              />

              <Box sx={{ my: 5 }}>
                <Checkbox
                  label={tInvest('agreement')}
                  value={agreed}
                  onChange={onAgreedChange}
                />
              </Box>

              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isDirty || !agreed}
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
