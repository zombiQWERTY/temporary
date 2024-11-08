'use server';
import { NextResponse } from 'next/server';
import { signIn, InvalidLoginError, SignInApi } from '@/shared/auth';

export const signInAction = async (values: SignInApi.SignInArgsSchema) => {
  const { email, password } = values;

  try {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    NextResponse.redirect(res, {
      status: 302,
    });
  } catch (error: any) {
    if (error instanceof InvalidLoginError) {
      return { error: error.message || 'An error occurred' };
    }

    throw error;
  }
};
