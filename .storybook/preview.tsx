import React from 'react';
import type { Preview } from '@storybook/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';

import { fontInter } from '../src/shared/theme';

import '@fontsource/material-icons';
import { createMuiTheme, ThemeMode } from '../src/shared/theme';
import nextIntl from './next-intl';

const lightTheme = createMuiTheme();

const preview: Preview = {
  initialGlobals: {
    locale: 'en',
    locales: {
      en: 'English',
      ru: 'Русский',
    },
  },
  parameters: {
    nextIntl,
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      document.body.classList.add(fontInter.className);
      return <Story />;
    },
    withThemeFromJSXProvider({
      GlobalStyles: CssBaseline,
      Provider: ThemeProvider,
      themes: {
        light: lightTheme,
      },
      defaultTheme: ThemeMode.Light,
    }),
  ],
};

export default preview;
