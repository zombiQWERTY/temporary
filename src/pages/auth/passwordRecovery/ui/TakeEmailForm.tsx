'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { AuthContainer } from '@/widgets/AuthContainer';
import { ConfirmOperationState } from '@/features/confirmations';
import { ResetPasswordApi } from '@/entities/Auths';
import { ServerError } from '@/shared/api';
import { useI18nZodErrors } from '@/shared/i18n';
import { useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';
import { InputTextField } from '@/shared/ui';
import { PageTypeEnum } from '../model/types';

const defaultValues: ResetPasswordApi.ResetPasswordArgsSchema = {
  email: '',
};

interface TakeEmailProps {
  setPageState: Dispatch<SetStateAction<PageTypeEnum>>;
  setPasswordRecoveryState: Dispatch<SetStateAction<ConfirmOperationState>>;
}

export const TakeEmailForm = ({
  setPageState,
  setPasswordRecoveryState,
}: TakeEmailProps) => {
  useI18nZodErrors();
  const t = useTranslations();
  const toast = useToast();

  const form = useForm<ResetPasswordApi.ResetPasswordArgsSchema>({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(ResetPasswordApi.ResetPasswordArgsSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = async (args: ResetPasswordApi.ResetPasswordArgsSchema) => {
    ResetPasswordApi.request(args)
      .then((res) => {
        setPasswordRecoveryState({
          ttl: res.ttl,
          email: args.email,
          sentAt: new Date(),
        });

        setPageState(PageTypeEnum.NewPassword);
      })
      .catch((e: unknown) => {
        const { error } = e as ServerError;
        toast.error(error);
      });
  };

  return (
    <AuthContainer
      subTitle={t('Auth.RecoveryPassword.description_if_forgot')}
      title={t('Auth.Common.recovery_password_title')}
      backUrl={Routes.SignIn}
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" gap={12}>
            <InputTextField
              name="email"
              label={t('Auth.RecoveryPassword.Fields.email')}
              variant="filled"
            />

            <LoadingButton
              variant="contained"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              {t('Auth.RecoveryPassword.submit_action')}
            </LoadingButton>
          </Stack>
        </form>
      </FormProvider>
    </AuthContainer>
  );
};
