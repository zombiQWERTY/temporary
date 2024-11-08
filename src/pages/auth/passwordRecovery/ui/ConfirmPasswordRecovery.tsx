'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AuthContainer } from '@/widgets/AuthContainer';
import {
  ConfirmOperation,
  ConfirmOperationState,
} from '@/features/confirmations';
import { OtpTypeEnum } from '@/entities/Alerts';
import { ConfirmResetPasswordApi } from '@/entities/Auths';
import { ServerError } from '@/shared/api';
import { signInAction } from '@/shared/auth';
import { useToast } from '@/shared/lib';
import { Routes } from '@/shared/router';

interface ConfirmPasswordRecoveryProps {
  recoveryState: Extract<ConfirmOperationState, { email: string }>;
  password: string;
}

export const ConfirmPasswordRecovery = ({
  recoveryState,
  password,
}: ConfirmPasswordRecoveryProps) => {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();

  const onSubmitPin = async (code: string) => {
    try {
      await ConfirmResetPasswordApi.request({
        code,
        password,
        email: recoveryState.email,
      });

      const signInResponse = await signInAction({
        password,
        email: recoveryState.email,
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
      title={t('Auth.Common.recovery_password_title')}
      subTitle={t('Auth.RecoveryPassword.sent_code', {
        email: recoveryState.email,
      })}
    >
      <ConfirmOperation
        eventType={OtpTypeEnum.RESET_PASSWORD}
        onSubmitPin={onSubmitPin}
        state={recoveryState}
      />
    </AuthContainer>
  );
};
