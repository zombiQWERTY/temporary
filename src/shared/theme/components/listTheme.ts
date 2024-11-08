import type { Components, Theme } from '@mui/material';

export const listTheme: Components<Theme>['MuiList'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(3),
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    }),
  },
};

export const listItemButtonTheme: Components<Theme>['MuiListItemButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius * 1.5,
      color: theme.palette.grey[400],
      '&:hover': {
        background: theme.palette.grey[50],
      },
    }),
    selected: ({ theme }) => ({
      background: theme.palette.secondary.main,
      color: theme.palette.primary.main,
    }),
  },
};

export const listItemIconTheme: Components<Theme>['MuiListItemIcon'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      minWidth: 'auto',
      fontSize: '24px',
      color: theme.palette.grey[400],
      '.Mui-selected &': {
        color: theme.palette.primary.main,
      },
    }),
  },
};

export const listItemTextTheme: Components<Theme>['MuiListItemText'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.grey[400],
      '.Mui-selected &': {
        color: theme.palette.primary.main,
      },
    }),
  },
};
