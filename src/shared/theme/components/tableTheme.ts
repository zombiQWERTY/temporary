import type { Components, Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const tableCellTheme: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
    head: () => ({
      ...typographyCustomTheme.BodyMRegular,
      fontWeight: '400!important',
    }),
  },
};

export const tableRowTheme: Components<Theme>['MuiTableRow'] = {
  styleOverrides: {
    head: () => ({
      boxShadow: 'none !important',
    }),
  },
};
