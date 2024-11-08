import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

import {
  MuiLocalizationProvider,
  SessionProvider,
  ToastProvider,
  ThemeProvider,
  JotaiProvider,
  LocalizationProvider,
  ProgressBarProvider,
  UserProvider,
  TanstackQueryProvider,
  ModalProvider,
} from '@/app/providers';
import { ProfileApi } from '@/entities/Profiles';
import { auth } from '@/shared/auth';
import { fontInter } from '@/shared/theme';

import './globals.css';

export const metadata: Metadata = {
  title: 'Mind Money Limited',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();
  const user = session
    ? await ProfileApi.fetchProfileRequest().catch(() => null)
    : null;

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={fontInter.className}>
        <TanstackQueryProvider>
          <AppRouterCacheProvider
            options={{ enableCssLayer: true, prepend: true }}
          >
            <SessionProvider session={session}>
              <UserProvider user={user}>
                <LocalizationProvider messages={messages}>
                  <MuiLocalizationProvider>
                    <JotaiProvider>
                      <ThemeProvider>
                        <ProgressBarProvider>
                          <ToastProvider>
                            <ModalProvider>
                              {children}
                              {/*<LocaleSwitcher />*/}
                            </ModalProvider>
                          </ToastProvider>
                        </ProgressBarProvider>
                      </ThemeProvider>
                    </JotaiProvider>
                  </MuiLocalizationProvider>
                </LocalizationProvider>
              </UserProvider>
            </SessionProvider>
          </AppRouterCacheProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
