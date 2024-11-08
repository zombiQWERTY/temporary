'use client';

import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';

import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { useToast } from '@/shared/lib';
import { OtpTypeEnum, SendEmailCodeApi } from '../../../../entities/Alerts';
import { getExpireAfter } from '../lib/getExpireAfter';
import { ConfirmOperationState } from '../model/types';

interface ResendOtpButtonProps {
  eventType: OtpTypeEnum;
  state: Extract<ConfirmOperationState, { email: string }>;
}

export const ResendCodeButton = ({
  state,
  eventType,
}: ResendOtpButtonProps) => {
  const [secondsLeft, setSecondsLeft] = useState(
    getExpireAfter(state.ttl, state.sentAt),
  );
  const { data: user } = useUser();
  const t = useTranslations('Widgets.ConfirmPin');
  const toast = useToast();

  const startCounter = useCallback(() => {
    const updateCounter = () => setSecondsLeft((prev) => Math.max(prev - 1, 0));
    if (secondsLeft > 0) {
      const interval = setInterval(updateCounter, 1000);
      return () => clearInterval(interval);
    }
  }, [secondsLeft]);

  useEffect(() => {
    return startCounter();
  }, [startCounter]);

  const handleResendCode = async () => {
    try {
      const res = await SendEmailCodeApi.request(
        { email: state.email, type: eventType },
        { hasUser: Boolean(user) },
      );

      const coolDown = getExpireAfter(Number(res.ttl), new Date());
      setSecondsLeft(coolDown);
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleResendCode}
      disabled={secondsLeft > 0}
    >
      {secondsLeft > 0
        ? t('send_code_again_after', { seconds: secondsLeft })
        : t('send_code_again')}
    </Button>
  );
};
