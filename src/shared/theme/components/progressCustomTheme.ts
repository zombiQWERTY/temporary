import type { Components, Theme } from '@mui/material';

export const linearProgressTheme: Components<Theme>['MuiLinearProgress'] = {
  styleOverrides: {
    root: {
      borderRadius: 5,
    },
    bar: {
      borderRadius: 5,
    },
  },
};
