import type { Components, Theme } from '@mui/material';

export const radioTheme: Components<Theme>['MuiRadio'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.grey[100],
      '&:hover': {
        color: theme.palette.text.secondary,
      },
      '&.Mui-checked': {
        color: theme.palette.primary.main,
      },
      '&.Mui-checked:hover': {
        color: theme.palette.text.secondary,
      },
    }),
  },
};
