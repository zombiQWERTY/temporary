'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { AuthContainer } from '@/widgets/AuthContainer';
import { MultilinePasswordValidator } from '@/widgets/MultilinePasswordValidator';
import { ConfirmResetPasswordApi } from '@/entities/Auths';
import { useI18nZodErrors } from '@/shared/i18n';
import { Routes } from '@/shared/router';
import { InputPasswordField } from '@/shared/ui';
import { NewPasswordArgsSchema, PageTypeEnum } from '../model/types';

interface NewPasswordFormProps {
  setPageState: Dispatch<SetStateAction<PageTypeEnum>>;
  setPassword: Dispatch<SetStateAction<string | null>>;
}

const defaultValues: NewPasswordArgsSchema = {
  password: '',
  confirmPassword: '',
};

export const NewPasswordForm = ({
  setPassword,
  setPageState,
}: NewPasswordFormProps) => {
  useI18nZodErrors();
  const t = useTranslations();

  const form = useForm<ConfirmResetPasswordApi.NewPasswordArgsSchema>({
    mode: 'onBlur',
    defaultValues,
    resolver: zodResolver(NewPasswordArgsSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = async (
    args: ConfirmResetPasswordApi.NewPasswordArgsSchema,
  ) => {
    const { password } = args;

    if (password) {
      setPassword(password);
      setPageState(PageTypeEnum.Confirm);
    }
  };

  return (
    <AuthContainer
      backUrl={Routes.SignIn}
      title={t('Auth.Common.recovery_password_title')}
      subTitle={t('Auth.NewPassword.subtitle')}
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" gap={12}>
            <Stack direction="column" gap={6}>
              <Stack>
                <InputPasswordField
                  name="password"
                  label={t('Auth.NewPassword.Fields.password')}
                  placeholder={t('Auth.NewPassword.Fields.password')}
                  variant="filled"
                  withHelperText={false}
                />

                <MultilinePasswordValidator name="password" />
              </Stack>

              <InputPasswordField
                name="confirmPassword"
                label={t('Auth.NewPassword.Fields.repeatPassword')}
                placeholder={t('Auth.NewPassword.Fields.repeatPassword')}
                variant="filled"
              />
            </Stack>

            <LoadingButton
              variant="contained"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              {t('Auth.NewPassword.submit_action')}
            </LoadingButton>
          </Stack>
        </form>
      </FormProvider>
    </AuthContainer>
  );
};
