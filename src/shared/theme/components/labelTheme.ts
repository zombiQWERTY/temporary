import type { Components, Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const labelTheme: Components<Theme>['MuiInputLabel'] = {
  defaultProps: { variant: 'standard' },
  styleOverrides: {
    root: ({ theme }) => ({
      '&.Mui-focused:not(.Mui-error)': {
        color: theme.palette.text.secondary,
      },
    }),
    standard: ({ theme }) => ({
      transform: 'none',
      paddingBottom: theme.spacing(1),
      position: 'relative',
      ...typographyCustomTheme.FootnoteRegular,
    }),
    filled: ({ theme }) => ({
      ...typographyCustomTheme.BodyMRegular,
      transform: `translate(${theme.spacing(4)}, ${theme.spacing(4)}) scale(1)`,
      '&.MuiInputLabel-shrink': {
        transform: `translate(${theme.spacing(4)}, ${theme.spacing(1.5)}) scale(0.75)`,
      },
    }),
  },
};
