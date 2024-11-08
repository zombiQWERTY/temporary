import type { Components, Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const helperTextTheme: Components<Theme>['MuiFormHelperText'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      marginTop: theme.spacing(1),
      marginLeft: 0,
      position: 'absolute',
      bottom: '-20px',
      ...typographyCustomTheme.FootnoteRegular,
    }),
  },
};
