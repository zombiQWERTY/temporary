'use client';

import type { Session } from 'next-auth';
import { Context, createContext } from 'react';

type TUpdateSession = (data?: any) => Promise<Session | null | undefined>;

export enum SessionStatusEnum {
  authenticated = 'authenticated',
  unauthenticated = 'unauthenticated',
  loading = 'loading',
}

export type TSessionContextValue = {
  data: Session | null;
  status: SessionStatusEnum;
  update: TUpdateSession;
};

export const SessionContext: Context<TSessionContextValue | undefined> =
  createContext?.<TSessionContextValue | undefined>(undefined);
