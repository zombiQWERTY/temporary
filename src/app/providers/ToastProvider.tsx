'use client';

import { SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';

export interface SnackbarProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: SnackbarProviderProps) => {
  return <SnackbarProvider>{children}</SnackbarProvider>;
};
