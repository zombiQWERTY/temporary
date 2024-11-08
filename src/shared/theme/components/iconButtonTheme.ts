import type { Components, Theme } from '@mui/material';

export const iconButtonTheme: Components<Theme>['MuiIconButton'] = {
  defaultProps: {
    variant: 'standard',
  },
  styleOverrides: {
    sizeExtraLarge: ({ theme }) => ({
      fontSize: '24px',
      padding: theme.spacing(2),
    }),
    sizeLarge: ({ theme }) => ({
      fontSize: '24px',
      padding: theme.spacing(1.5),
    }),
    sizeMedium: ({ theme }) => ({
      fontSize: '20px',
      padding: theme.spacing(1.5),
    }),
    sizeSmall: ({ theme }) => ({
      fontSize: '20px',
      padding: theme.spacing(1),
    }),
    sizeExtraSmall: ({ theme }) => ({
      fontSize: '16px',
      padding: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.5),
      },
    }),
    colorPrimary: ({ theme }) => ({
      color: theme.palette.grey[500],
    }),

    colorSecondary: ({ theme }) => ({
      color: theme.palette.grey[300],
    }),
  },
  variants: [
    {
      props: { variant: 'outlineSquare' },
      style: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        boxShadow: `inset 0 0 0 1px ${theme.palette.grey[100]}`,
      }),
    },
    {
      props: { variant: 'outlineRound' },
      style: ({ theme }) => ({
        boxShadow: `inset 0 0 0 1px ${theme.palette.grey[100]}`,
      }),
    },
    {
      props: { variant: 'filledSquare' },
      style: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover': {
          background: theme.palette.primary.dark,
          color: theme.palette.grey[100],
        },
      }),
    },
    {
      props: { variant: 'filledRound' },
      style: ({ theme }) => ({
        borderRadius: '50%',
        background: theme.palette.grey[50],
      }),
    },
  ],
};
