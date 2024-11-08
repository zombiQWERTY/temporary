'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Grid, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useShowConfirmPinFormModal } from '@/features/confirmations';
import { formatMoney } from '@/entities/Accounts';
import { OtpTypeEnum } from '@/entities/Alerts';
import { MakeWithdrawalTMRequestApi } from '@/entities/Transactions';
import { GetInvestmentsApi } from '@/entities/TrustManagements';
import { ServerError } from '@/shared/api';
import { CurrencyCodes } from '@/shared/commonProjectParts';
import { useToast } from '@/shared/lib';
import { DialogProps, InputTextField } from '@/shared/ui';

const WithdrawTMFormSchema =
  MakeWithdrawalTMRequestApi.MakeWithdrawalTMRequestArgsSchema.omit({
    investmentId: true,
    code: true,
  }).extend({
    shareCost: z.string(),
    sharesEstimateCost: z.string(),
    amount: z.string(),
  });

type WithdrawTMFormSchema = z.infer<typeof WithdrawTMFormSchema>;

const defaultValues: WithdrawTMFormSchema = {
  sharesAmount: '' as unknown as number,
  sharesEstimateCost: '',
  shareCost: '',
  amount: '',
};

const dataMappers = {
  fromForm: (
    data: WithdrawTMFormSchema,
    code: string,
    investmentId: number,
  ): MakeWithdrawalTMRequestApi.MakeWithdrawalTMRequestArgsSchema => ({
    code,
    investmentId,
    sharesAmount: data.sharesAmount,
  }),
};

interface WithdrawFormProps {
  closeModal: DialogProps['onClose'];
  investment: GetInvestmentsApi.InvestmentSchema;
}

export const WithdrawForm = ({ closeModal, investment }: WithdrawFormProps) => {
  const toast = useToast();
  const t = useTranslations('Features.Strategies.Forms.Common');
  const tWithdraw = useTranslations('Features.Strategies.Forms.Withdraw');

  const form = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(
      WithdrawTMFormSchema.superRefine((values, context) => {
        if (values.sharesAmount > investment.totalShares) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('less_or_equal'),
            path: ['sharesAmount'],
          });
        }
      }),
    ),
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    watch,
    reset,
    getValues,
    setValue,
  } = form;

  const sharesAmount = watch('sharesAmount');

  useEffect(() => {
    reset({
      ...defaultValues,
      shareCost: formatMoney(
        investment.shareCost || BigInt(0),
        investment.strategyCurrency as CurrencyCodes,
      ),
      sharesEstimateCost: formatMoney(
        investment.totalShares * (investment.shareCost || BigInt(0)),
        investment.strategyCurrency as CurrencyCodes,
      ),
    });
  }, [
    investment.shareCost,
    investment.strategyCurrency,
    investment.totalShares,
    reset,
  ]);

  const calculatedAmount = useMemo(() => {
    return BigInt(sharesAmount) * (investment.shareCost || BigInt(0));
  }, [sharesAmount, investment.shareCost]);

  useEffect(() => {
    setValue(
      'amount',
      formatMoney(
        calculatedAmount,
        investment.strategyCurrency as CurrencyCodes,
      ),
    );
  }, [setValue, calculatedAmount, investment.strategyCurrency]);

  const onCodeSubmit = useCallback(
    async (code: string) => {
      try {
        const data = getValues();
        await MakeWithdrawalTMRequestApi.request(
          dataMappers.fromForm(data, code, investment.id),
        );

        toast.success(t('request_has_been_sent'));
        reset(defaultValues);
        closeModal?.({}, 'backdropClick');
      } catch (e: unknown) {
        const { error } = e as ServerError;
        toast.error(error);
      }
    },
    [closeModal, getValues, investment.id, reset, t, toast],
  );

  const { showModal } = useShowConfirmPinFormModal({
    eventType: OtpTypeEnum.CONFIRM_TRANSACTION,
    onCodeSubmit,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(showModal)}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Stack direction="column" gap={6}>
              <InputTextField
                name="sharesAmount"
                label={tWithdraw('shares_amount')}
                placeholder={tWithdraw('shares_amount')}
                type="number"
                fullWidth
                onKeyDown={(e) => {
                  if (
                    e.key === 'e' ||
                    e.key === 'E' ||
                    e.key === '-' ||
                    e.key === '+'
                  ) {
                    e.preventDefault();
                  }
                }}
              />

              <InputTextField
                name="shareCost"
                label={tWithdraw('share_cost')}
                placeholder={tWithdraw('share_cost')}
                disabled
                fullWidth
              />

              <InputTextField
                name="sharesEstimateCost"
                label={tWithdraw('shares_estimate_cost')}
                placeholder={tWithdraw('shares_estimate_cost')}
                disabled
                fullWidth
              />

              <InputTextField
                name="amount"
                label={tWithdraw('amount_to_be_withdrawn')}
                placeholder={tWithdraw('amount_to_be_withdrawn')}
                readOnly
                fullWidth
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
