import type { Components, Theme } from '@mui/material';

export const inputTheme: Components<Theme>['MuiInput'] = {
  styleOverrides: {
    root: {
      'label+&': {
        marginTop: 0,
      },
    },
  },
};
