'use client';
import LanguageIcon from '@mui/icons-material/Language';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import { ReactNode, useState, useCallback } from 'react';

import { setUserLocale } from '@/shared/i18n';
import { USAFlagIcon, RussiaFlagIcon } from './flags';

type LanguageOption = {
  code: 'en' | 'ru';
  name: string;
  icon: ReactNode;
};

const languageOptions: LanguageOption[] = [
  { code: 'ru', name: 'Русский', icon: <RussiaFlagIcon /> },
  { code: 'en', name: 'English', icon: <USAFlagIcon /> },
];

export const LocaleSwitcher = () => {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(
    (status: boolean) => () => setOpen(status),
    [],
  );

  const handleLanguageChange = useCallback(
    async (code: LanguageOption['code']) => {
      await setUserLocale(code);
      setOpen(false);
    },
    [],
  );

  return (
    <SpeedDial
      ariaLabel="Language Switcher"
      icon={<LanguageIcon />}
      onClose={toggleOpen(false)}
      onOpen={toggleOpen(true)}
      open={open}
      direction="up"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
      }}
      FabProps={{
        sx: {
          backgroundColor: '#4A4A4A',
          ':hover': { backgroundColor: 'rgba(74, 74, 74, .8)' },
        },
      }}
    >
      {languageOptions.map(({ code, name, icon }) => (
        <SpeedDialAction
          key={code}
          icon={icon}
          tooltipTitle={name}
          onClick={() => handleLanguageChange(code)}
        />
      ))}
    </SpeedDial>
  );
};
