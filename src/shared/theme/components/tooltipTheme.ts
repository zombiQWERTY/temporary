import type { Components, Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const muiTooltipTheme: Components<Theme>['MuiTooltip'] = {
  styleOverrides: {
    tooltip: ({ theme }) => ({
      background: theme.palette.common.black,
      color: theme.palette.common.white,
      ...typographyCustomTheme.FootnoteRegular,
      padding: theme.spacing(2, 3),
    }),
    arrow: ({ theme }) => ({
      color: theme.palette.common.black,
    }),
  },
};
