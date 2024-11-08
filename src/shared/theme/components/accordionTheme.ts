import type { Components, Theme } from '@mui/material';

export const accordionTheme: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      transition: 'all 200ms ease',
      '&:last-of-type': {
        borderBottomLeftRadius: theme.spacing(3),
        borderBottomRightRadius: theme.spacing(3),
      },
      '&:first-of-type': {
        borderTopLeftRadius: theme.spacing(3),
        borderTopRightRadius: theme.spacing(3),
      },
      '&:hover': {
        boxShadow: '2px 2px 40px 0px rgba(0, 0, 0, 0.10)',
      },
    }),
  },
};

export const accordionSummaryTheme: Components<Theme>['MuiAccordionSummary'] = {
  styleOverrides: {
    root: () => ({
      padding: '0 24px',
    }),
  },
};

export const accordionDetailsTheme: Components<Theme>['MuiAccordionDetails'] = {
  styleOverrides: {
    root: () => ({
      padding: '0 24px',
      paddingBottom: '16px',
    }),
  },
};
