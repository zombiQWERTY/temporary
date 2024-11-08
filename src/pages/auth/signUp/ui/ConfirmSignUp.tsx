'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AuthContainer } from '@/widgets/AuthContainer';
import {
  ConfirmOperation,
  ConfirmOperationState,
} from '@/features/confirmations';
import { OtpTypeEnum } from '@/entities/Alerts';
import { ConfirmEmailApi } from '@/entities/Auths';
import { ServerError } from '@/shared/api';
import { signInAction } from '@/shared/auth';
import { useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';
import { SignUpState } from '../model/types';

interface ConfirmSignUpProps {
  otpState: Extract<ConfirmOperationState, { email: string }>;
  signUpState: SignUpState;
}

export const ConfirmSignUp = ({
  otpState,
  signUpState,
}: ConfirmSignUpProps) => {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();

  const onSubmitPin = async (code: string) => {
    if (!signUpState.phone || !signUpState.password || !signUpState.email) {
      return;
    }

    try {
      await ConfirmEmailApi.request({
        code,
        password: signUpState.password,
        email: signUpState.email,
        phone: signUpState.phone,
        referralCode: signUpState.referralCode,
      });

      const signInResponse = await signInAction({
        password: signUpState.password,
        email: signUpState.email,
      });

      router.push(Routes.Dashboard);

      if (signInResponse && 'error' in signInResponse) {
        toast.error(signInResponse.error);
      }
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
    }
  };

  return (
    <AuthContainer
      backUrl={Routes.SignIn}
      title={t('Auth.Common.verification_code')}
      subTitle={t('Auth.ConfirmEmail.subtitle', {
        email: signUpState.email,
      })}
    >
      <ConfirmOperation
        eventType={OtpTypeEnum.SIGN_UP}
        onSubmitPin={onSubmitPin}
        state={otpState}
      />
    </AuthContainer>
  );
};
