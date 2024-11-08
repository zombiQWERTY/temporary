import type { Components, Theme, ButtonOwnProps } from '@mui/material';
import { blue } from '@/shared/theme/colorTheme';

import { LinkBehaviour } from './LinkBehaviour';

export const buttonSizes: ButtonOwnProps['size'][] = [
  'large',
  'medium',
  'small',
] as const;

export const buttonVariants: ButtonOwnProps['variant'][] = [
  'main',
  'secondary',
  'linear',
  'ghost',
];

export const buttonCustomTheme: Components<Theme>['MuiButton'] = {
  defaultProps: {
    variant: 'main',
    LinkComponent: LinkBehaviour,
  },
  styleOverrides: {
    root: {
      fontWeight: 600,
      fontStyle: 'normal',
      textTransform: 'none',
      borderRadius: 8,
      boxSizing: 'border-box',
    },
    sizeLarge: ({ theme }) => ({
      fontSize: 20,
      lineHeight: '32px',
      padding: theme.spacing(4, 5),
    }),
    sizeMedium: ({ theme }) => ({
      fontSize: 16,
      lineHeight: '24px',
      padding: theme.spacing(3, 4),
    }),
    sizeSmall: ({ theme }) => ({
      fontSize: 12,
      lineHeight: '16px',
      padding: theme.spacing(2, 3),
    }),
  },
  variants: [
    {
      props: { variant: 'main' },
      style: ({ theme }) => ({
        color: theme.palette.common.white,
        background: theme.palette.primary.main,
        ':hover': {
          background: theme.palette.primary.dark,
        },
        ':disabled': {
          background: theme.palette.secondary.dark,
          color: theme.palette.common.white,
        },
      }),
    },
    {
      props: { variant: 'secondary' },
      style: ({ theme }) => ({
        color: theme.palette.primary.main,
        background: theme.palette.secondary.main,
        ':hover': {
          background: theme.palette.secondary.light,
        },
        ':disabled': {
          color: blue[300],
          background: theme.palette.secondary.main,
        },
      }),
    },
    {
      props: { variant: 'linear' },
      style: ({ theme }) => ({
        color: theme.palette.primary.main,
        background: theme.palette.common.white,
        boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
        ':hover': {
          color: theme.palette.secondary.dark,
          background: theme.palette.common.white,
          boxShadow: `inset 0 0 0 1px ${theme.palette.secondary.dark}`,
        },
        ':disabled': {
          color: blue[300],
          background: theme.palette.common.white,
          boxShadow: `inset 0 0 0 1px ${theme.palette.secondary.dark}`,
        },
      }),
    },
    {
      props: { variant: 'ghost' },
      style: ({ theme }) => ({
        color: theme.palette.primary.main,
        background: theme.palette.common.white,
        ':hover': {
          background: theme.palette.grey[50],
        },
        ':disabled': {
          color: theme.palette.secondary.dark,
          background: theme.palette.common.white,
        },
      }),
    },
    {
      props: { variant: 'contained' },
      style: ({ theme }) => ({
        ':disabled': {
          color: theme.palette.common.white,
          background: theme.palette.secondary.dark,
        },
      }),
    },
  ],
};
