'use client';

import { Context, createContext } from 'react';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';

export enum UserStatusEnum {
  loading = 'loading',
  success = 'success',
  error = 'error',
}

export type TUserContextValue = {
  data: ProfileDtoSchema | null;
  status: UserStatusEnum;
  update: () => Promise<ProfileDtoSchema | null>;
};

export const UserContext: Context<TUserContextValue | undefined> =
  createContext<TUserContextValue | undefined>(undefined);
