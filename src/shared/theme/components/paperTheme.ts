import type { Components, Theme } from '@mui/material';

export const paperTheme: Components<Theme>['MuiPaper'] = {
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      border: `1px solid ${theme.palette.grey[200]}`,
      borderRadius: 16,
    }),
  },
};
