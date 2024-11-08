import { type Components, type Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const inputBaseTheme: Components<Theme>['MuiInputBase'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius,
      boxShadow: `inset 0 0 0 1px ${theme.palette.grey[100]}`,
      '&::placeholder': {
        color: theme.palette.text.secondary,
      },
      '&:not(.Mui-disabled):not(.Mui-error):hover': {
        boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
      },
      '&.Mui-focused': {
        boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
      },
      '&.Mui-error': {
        boxShadow: `inset 0 0 0 1px ${theme.palette.error.main}`,
        '&.Mui-focused': {
          boxShadow: `inset 0 0 0 1px ${theme.palette.error.main}`,
        },
      },
      '&::after': {
        display: 'none',
      },
      '&::before': {
        display: 'none',
      },
      'label.MuiInputLabel-filled+&': {
        padding: theme.spacing(4, 4, 1.5),
        alignItems: 'start',
        '&>input': {
          padding: theme.spacing(2.5, 0, 0),
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2.25, 0, 0),
          },
        },
      },
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3.5, 4),
        'label.MuiInputLabel-filled+&': {
          padding: theme.spacing(3.5, 4, 1.25),
        },
      },
      '&.MuiInputCode': {
        width: '64px',
        height: '72px',
        background: theme.palette.grey[100],
        boxShadow: `inset 0 0 0 1px ${theme.palette.grey[100]}`,
        '&:focus-within': {
          boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
        },
        '&.Mui-error': {
          background: theme.palette.error.light,
          color: theme.palette.error.main,
          boxShadow: `inset 0 0 0 1px ${theme.palette.error.main}`,
          '&:focus-within': {
            background: theme.palette.error.light,
          },
        },
      },
    }),
    input: ({ theme }) => ({
      ...typographyCustomTheme.BodyMRegular,
      padding: theme.spacing(4, 4),
      height: 'auto',
      [theme.breakpoints.down('sm')]: {
        ...typographyCustomTheme.BodySRegular,
      },
      '.MuiInputCode &': {
        textAlign: 'center',
        ...typographyCustomTheme.Heading03,
        caretColor: 'transparent',
        '&.input::-webkit-outer-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '&::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '&[type=number]': {
          MozAppearance: 'textfield',
        },
        '&:focus': {
          boxShadow: `0px 2px 0px ${theme.palette.primary.main}`,
        },
      },
    }),
  },
};
