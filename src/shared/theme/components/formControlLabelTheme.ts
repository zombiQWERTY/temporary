import type { Components, Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const formControlLabelTheme: Components<Theme>['MuiFormControlLabel'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      ...typographyCustomTheme.BodySRegular,
      margin: 0,
      gap: theme.spacing(3),
      color: theme.palette.grey[500],
      alignItems: 'flex-start',
    }),
    label: () => ({
      fontSize: '14px',
    }),
  },
};
