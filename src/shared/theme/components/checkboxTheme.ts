import type { Components, Theme } from '@mui/material';

export const checkboxTheme: Components<Theme>['MuiCheckbox'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.grey[100],
      padding: 0,
      borderRadius: theme.shape.borderRadius,
      '&:hover': {
        color: theme.palette.text.secondary,
      },
      '&.Mui-checked': {
        color: theme.palette.primary.main,
      },
      '&.Mui-checked:hover': {
        color: theme.palette.primary.dark,
      },
    }),
  },
};
