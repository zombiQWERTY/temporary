'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Button, Link, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { OtpTypeEnum } from '@/entities/Alerts';
import { useI18nZodErrors } from '@/shared/i18n';
import { Routes } from '@/shared/router';
import { InputPinField } from '@/shared/ui';
import {
  ConfirmOperationState,
  ConfirmPinArgs,
  ConfirmPinArgsSchema,
} from '../model/types';
import { ResendCodeButton } from './ResendCodeButton';

interface ConfirmOperationProps {
  onSubmitPin: (code: string) => void;
  eventType: OtpTypeEnum;
  closeModal?: () => void;
  state: Extract<ConfirmOperationState, { email: string }>;
}

export const ConfirmOperation = ({
  onSubmitPin,
  eventType,
  closeModal,
  state,
}: ConfirmOperationProps) => {
  useI18nZodErrors();

  const t = useTranslations('Widgets.ConfirmOperationPin');
  const form = useForm<ConfirmPinArgs>({
    mode: 'onSubmit',
    resolver: zodResolver(ConfirmPinArgsSchema),
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const handleFormSubmit = useCallback(
    (values: ConfirmPinArgs) => {
      if (values.code) {
        onSubmitPin(values.code);
        closeModal?.();
      }
    },
    [closeModal, onSubmitPin],
  );

  const cancelButton = useMemo(() => {
    switch (eventType) {
      case OtpTypeEnum.CONFIRM_TRANSACTION: {
        return (
          <Button variant="ghost" onClick={closeModal}>
            {t('cancel')}
          </Button>
        );
      }

      default: {
        return (
          <Button component={Link} href={Routes.SignIn} variant="ghost">
            {t('cancel')}
          </Button>
        );
      }
    }
  }, [closeModal, eventType, t]);

  const resetPasswordButtonsSx = {
    flexDirection: 'column',
    alignItems: 'flex-start',
  };
  const buttonsSx = {
    flexDirection: 'row',
    justifyContent: 'space-between',
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack direction="column" gap={6}>
          <InputPinField name="code" />

          <Stack
            sx={
              eventType === OtpTypeEnum.RESET_PASSWORD
                ? resetPasswordButtonsSx
                : buttonsSx
            }
          >
            <ResendCodeButton state={state} eventType={eventType} />
            {eventType === OtpTypeEnum.RESET_PASSWORD && (
              <Button href={Routes.PasswordRecovery} variant="text">
                {t('change_email')}
              </Button>
            )}
            {cancelButton}
          </Stack>

          <LoadingButton variant="contained" type="submit" disabled={!isValid}>
            {t('confirm')}
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  );
};
