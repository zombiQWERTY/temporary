'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Box, Link, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';

import { AuthContainer } from '@/widgets/AuthContainer';
import { SignInApi } from '@/shared/auth';
import { signInAction } from '@/shared/auth';
import { useI18nZodErrors } from '@/shared/i18n';
import { useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';
import { InputPasswordField, InputTextField } from '@/shared/ui';

const defaultValues: SignInApi.SignInArgsSchema = {
  email: '',
  password: '',
};

export const SignIn = () => {
  useI18nZodErrors();
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();

  const form = useForm<SignInApi.SignInArgsSchema>({
    mode: 'onSubmit',
    defaultValues,
    resolver: zodResolver(SignInApi.SignInArgsSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const onSubmit = async (args: SignInApi.SignInArgsSchema) => {
    const res = await signInAction(args);

    if (res && 'error' in res) {
      toast.error(res.error);
      return;
    }

    router.push(Routes.Dashboard);
  };

  return (
    <AuthContainer>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" gap={6}>
            <InputTextField
              name="email"
              label={t('Profile.Fields.Privacy.email')}
              placeholder={t('Profile.Fields.Privacy.email')}
              variant="filled"
            />

            <InputPasswordField
              name="password"
              label={t('Profile.Fields.Privacy.password')}
              placeholder={t('Profile.Fields.Privacy.password')}
              variant="filled"
            />

            <Stack direction="column" gap={12}>
              <Box>
                <Link href={Routes.PasswordRecovery} underline="none">
                  {t('Auth.SignIn.forgot_password')}
                </Link>
              </Box>

              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isDirty}
                loading={isSubmitting}
              >
                {t('Auth.SignIn.submit_action')}
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </FormProvider>
    </AuthContainer>
  );
};
