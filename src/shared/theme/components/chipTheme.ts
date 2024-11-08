import type { Components, Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const chipTheme: Components<Theme>['MuiChip'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.common.white,
      ...typographyCustomTheme.FootnoteMedium,
    }),
  },
};
