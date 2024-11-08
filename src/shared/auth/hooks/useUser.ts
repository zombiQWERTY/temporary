'use client';

import { useContext } from 'react';
import { UserContext, UserStatusEnum, TUserContextValue } from '../userContext';

export const useUser = (): TUserContextValue => {
  if (!UserContext) {
    throw new Error('React Context is unavailable in Server Components');
  }

  const userContent: TUserContextValue = useContext(UserContext) || {
    data: null,
    status: UserStatusEnum.loading,
    update: () => Promise.reject(null),
  };

  if (!userContent && process.env.NODE_ENV !== 'production') {
    throw new Error(
      '[user-wrapper-error]: `useUserData` must be wrapped in a <UserProvider />',
    );
  }

  return userContent;
};
