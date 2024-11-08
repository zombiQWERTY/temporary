import type { Components, Theme } from '@mui/material';
import { blue } from '@/shared/theme';
import { fontFamily } from '../fontTheme';
import { typographyCustomTheme } from './typographyCustomTheme';

export const stepTheme: Components<Theme>['MuiStep'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      [theme.breakpoints.down('xl')]: {
        paddingLeft: theme.spacing(6),
      },
      [theme.breakpoints.up('xl')]: {
        width: '100%',
      },
    }),
  },
};

export const stepIconTheme: Components<Theme>['MuiStepIcon'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: typographyCustomTheme.Heading05.fontSize,
      color: theme.palette.grey[100],
      [theme.breakpoints.down('xl')]: {
        width: theme.spacing(6),
        height: theme.spacing(6),
      },
    }),
    text: ({ theme }) => ({
      fontFamily,
      ...typographyCustomTheme.BodySRegular,
      fill: theme.palette.grey[400],
      '.Mui-active &': {
        fill: theme.palette.common.white,
        display: 'block',
      },
      [theme.breakpoints.down('xl')]: {
        display: 'none',
      },
    }),
  },
};

export const stepLabelTheme: Components<Theme>['MuiStepLabel'] = {
  styleOverrides: {
    label: ({ theme }) => ({
      ...typographyCustomTheme.BodySRegular,
      color: theme.palette.grey[400],
      '&.Mui-completed': {
        color: theme.palette.grey[400],
      },
      '&.Mui-active': {
        color: theme.palette.primary.main,
      },
    }),
    iconContainer: ({ theme }) => ({
      marginRight: 0,
      paddingRight: 0,
      [theme.breakpoints.up('xl')]: {
        marginRight: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
      '&.Mui-disabled .MuiStepIcon-root': {
        [theme.breakpoints.down('xl')]: {
          width: theme.spacing(3),
          height: theme.spacing(3),
          border: `${theme.spacing(1.5)} solid ${blue[300]}`,
          borderRadius: '100%',
          color: theme.palette.common.white,
        },
      },
    }),
  },
};

export const stepConnectorTheme: Components<Theme>['MuiStepConnector'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      [theme.breakpoints.up('xl')]: {
        marginLeft: theme.spacing(4),
        minHeight: theme.spacing(8),
      },
    }),
    line: ({ theme }) => ({
      [theme.breakpoints.up('xl')]: {
        minHeight: theme.spacing(8),
      },
      borderColor: theme.palette.grey[100],
    }),
  },
};

export const stepButtonTheme: Components<Theme>['MuiStepButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      [theme.breakpoints.down('xl')]: {
        padding: `0 ${theme.spacing(2)}`,
        borderRadius: '100%',
      },
      [theme.breakpoints.up('xl')]: {
        width: '100%',
      },
    }),
  },
};
