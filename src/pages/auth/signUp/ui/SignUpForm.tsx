'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { AuthContainer } from '@/widgets/AuthContainer';
import { MultilinePasswordValidator } from '@/widgets/MultilinePasswordValidator';
import { ConfirmOperationState } from '@/features/confirmations';
import { ConfirmEmailApi, SignUpApi } from '@/entities/Auths';
import { ServerError } from '@/shared/api';
import { useI18nZodErrors } from '@/shared/i18n';
import { useToast } from '@/shared/lib';
import {
  CheckBoxField,
  InputPasswordField,
  InputPhoneField,
  InputTextField,
} from '@/shared/ui';
import { PageTypeEnum, SignUpState } from '../model/types';

const SignUpFormSchema = ConfirmEmailApi.ConfirmEmailArgsSchema.omit({
  code: true,
}).extend({
  agreement: z.boolean().refine(Boolean, {
    message: 'You must agree to the application terms',
  }),
});

type SignUpFormSchema = z.infer<typeof SignUpFormSchema>;

const defaultValues: SignUpFormSchema = {
  email: '',
  password: '',
  phone: '',
  referralCode: '',
  agreement: false,
};

interface SignUpFormProps {
  setPageState: Dispatch<SetStateAction<PageTypeEnum>>;
  setOtpState: Dispatch<SetStateAction<ConfirmOperationState>>;
  setSignUpState: Dispatch<SetStateAction<SignUpState>>;
}

export const SignUpForm = ({
  setPageState,
  setOtpState,
  setSignUpState,
}: SignUpFormProps) => {
  useI18nZodErrors();
  const toast = useToast();

  const t = useTranslations();

  const form = useForm<SignUpFormSchema>({
    mode: 'onBlur',
    defaultValues,
    resolver: zodResolver(SignUpFormSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = async (data: SignUpFormSchema) => {
    try {
      const res = await SignUpApi.request({
        email: data.email,
        phone: data.phone,
      });

      setSignUpState({
        referralCode: data.referralCode,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });

      setPageState(PageTypeEnum.Confirm);

      setOtpState({
        email: data.email,
        sentAt: new Date(),
        ttl: res.ttl,
      });
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
    }
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

            <InputPhoneField
              name="phone"
              label={t('Profile.Fields.Privacy.phone')}
              placeholder={t('Profile.Fields.Privacy.phone')}
              variant="filled"
            />

            <Stack>
              <InputPasswordField
                name="password"
                label={t('Profile.Fields.Privacy.password')}
                placeholder={t('Profile.Fields.Privacy.password')}
                variant="filled"
                withHelperText={false}
              />

              <MultilinePasswordValidator name="password" />
            </Stack>

            <InputTextField
              name="referralCode"
              label={t('Auth.SignUp.Fields.referral_code')}
              placeholder={t('Auth.SignUp.Fields.referral_code')}
              variant="filled"
            />

            <Stack direction="column" gap={12}>
              <CheckBoxField
                name="agreement"
                label={
                  <Typography variant="BodySRegular" color="grey.500">
                    {t.rich('Auth.SignUp.accept_agreement', {
                      terms: (text) => (
                        <Link
                          fontSize="inherit"
                          href="https://mind-money.eu/static/1f812d3177f1fe08862b42535b4881b0/c57e700d-4278-4246-9e48-5fa352f5d894_PRIVACY+POLICY.pdf"
                        >
                          {text}
                        </Link>
                      ),
                      privacy: (text) => (
                        <Link
                          fontSize="inherit"
                          href="https://mind-money.eu/static/1f812d3177f1fe08862b42535b4881b0/c57e700d-4278-4246-9e48-5fa352f5d894_PRIVACY+POLICY.pdf"
                        >
                          {text}
                        </Link>
                      ),
                    })}
                  </Typography>
                }
              />

              <LoadingButton
                variant="contained"
                type="submit"
                disabled={!isValid}
                loading={isSubmitting}
              >
                {t('Auth.SignUp.submit_action')}
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </FormProvider>
    </AuthContainer>
  );
};
