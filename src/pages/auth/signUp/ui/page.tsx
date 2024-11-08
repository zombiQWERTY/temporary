'use client';

import { useState } from 'react';

import { ConfirmOperationState } from '@/features/confirmations';
import { PageTypeEnum, SignUpState } from '../model/types';
import { ConfirmSignUp } from './ConfirmSignUp';
import { SignUpForm } from './SignUpForm';

export const SignUp = () => {
  const [pageState, setPageState] = useState<PageTypeEnum>(
    PageTypeEnum.Registration,
  );

  const [otpState, setOtpState] = useState<ConfirmOperationState>({
    email: null,
  });

  const [signUpState, setSignUpState] = useState<SignUpState>({
    phone: null,
    email: null,
    password: null,
  });

  if (pageState === PageTypeEnum.Registration) {
    return (
      <SignUpForm
        setPageState={setPageState}
        setSignUpState={setSignUpState}
        setOtpState={setOtpState}
      />
    );
  }

  if (
    pageState === PageTypeEnum.Confirm &&
    signUpState.email &&
    signUpState.password &&
    signUpState.phone &&
    otpState.email &&
    otpState.ttl &&
    otpState.sentAt
  ) {
    return <ConfirmSignUp otpState={otpState} signUpState={signUpState} />;
  }

  return null;
};
