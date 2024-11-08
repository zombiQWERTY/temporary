'use client';

import { Session } from 'next-auth';
import { useContext } from 'react';
import {
  SessionContext,
  SessionStatusEnum,
  TSessionContextValue,
} from '../sessionContext';

export function useSession(): TSessionContextValue {
  if (!SessionContext) {
    throw new Error('React Context is unavailable in Server Components');
  }

  const sessionContent: TSessionContextValue = useContext(SessionContext) || {
    data: null,
    status: SessionStatusEnum.unauthenticated,
    async update(): Promise<Session | null | undefined> {
      return undefined;
    },
  };

  if (!sessionContent && process.env.NODE_ENV !== 'production') {
    throw new Error(
      '[auth-wrapper-error]: `useSessionData` must be wrapped in a <SessionProvider />',
    );
  }

  return sessionContent;
}
