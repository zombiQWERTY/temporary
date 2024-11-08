import type { Components, Theme } from '@mui/material';

export const dialogActionsTheme: Components<Theme>['MuiDialogActions'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(0, 8, 8, 8),
    }),
  },
};
