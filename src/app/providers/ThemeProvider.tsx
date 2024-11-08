'use client';

import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { createMuiTheme } from '@/shared/theme';

interface StoreProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: StoreProviderProps) {
  const theme = useMemo(() => createMuiTheme(), []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
