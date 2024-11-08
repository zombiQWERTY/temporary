'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { setDefaultOptions } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { FC, PropsWithChildren } from 'react';

setDefaultOptions({ locale: enGB, weekStartsOn: 1 });

export const MuiLocalizationProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      {children}
    </LocalizationProvider>
  );
};
