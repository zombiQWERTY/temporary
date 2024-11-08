'use client';

import { useState } from 'react';

import { ConfirmOperationState } from '@/features/confirmations';
import { PageTypeEnum } from '../model/types';
import { ConfirmPasswordRecovery } from './ConfirmPasswordRecovery';
import { NewPasswordForm } from './NewPasswordForm';
import { TakeEmailForm } from './TakeEmailForm';

export const PasswordRecoveryPage = () => {
  const [pageState, setPageState] = useState<PageTypeEnum>(
    PageTypeEnum.Recovery,
  );

  const [recoveryState, setRecoveryState] = useState<ConfirmOperationState>({
    email: null,
  });

  const [password, setPassword] = useState<string | null>(null);

  if (pageState === PageTypeEnum.Recovery) {
    return (
      <TakeEmailForm
        setPageState={setPageState}
        setPasswordRecoveryState={setRecoveryState}
      />
    );
  }

  if (
    pageState === PageTypeEnum.NewPassword &&
    recoveryState.email &&
    recoveryState.ttl &&
    recoveryState.sentAt
  ) {
    return (
      <NewPasswordForm setPageState={setPageState} setPassword={setPassword} />
    );
  }

  if (
    pageState === PageTypeEnum.Confirm &&
    password &&
    recoveryState.email &&
    recoveryState.ttl &&
    recoveryState.sentAt
  ) {
    return (
      <ConfirmPasswordRecovery
        recoveryState={recoveryState}
        password={password}
      />
    );
  }

  return null;
};
