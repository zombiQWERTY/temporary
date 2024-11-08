import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { FC, PropsWithChildren } from 'react';

interface LocalizationProviderProps extends PropsWithChildren {
  messages: AbstractIntlMessages;
}

export const LocalizationProvider: FC<LocalizationProviderProps> = ({
  children,
  messages,
}) => {
  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};
