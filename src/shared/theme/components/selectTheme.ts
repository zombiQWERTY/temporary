import type { Components, Theme } from '@mui/material';

export const selectTheme: Components<Theme>['MuiSelect'] = {
  defaultProps: {
    color: 'primary',
    size: 'medium',
    variant: 'standard',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      '&.Mui-focused': {
        background: theme.palette.common.white,
      },
      '&.Mui-disabled': {
        background: theme.palette.common.white,
      },
      '&:hover': {
        background: theme.palette.common.white,
      },
    }),
    icon: ({ theme }) => ({
      color: theme.palette.text.secondary,
      transition: 'transform 0.22s ease-in',
      right: theme.spacing(4),
    }),
    filled: ({ theme }) => ({
      padding: theme.spacing(2.5, 0, 0),
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2.25, 0, 0),
      },
    }),
  },
  variants: [
    {
      props: { variant: 'filled' },
      style: ({ theme }) => ({
        background: theme.palette.common.white,
      }),
    },
  ],
};
