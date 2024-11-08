import type { Components, Theme } from '@mui/material';
import { LinkBehaviour } from './LinkBehaviour';
import { typographyCustomTheme } from './typographyCustomTheme';

export const tabsTheme: Components<Theme>['MuiTabs'] = {
  defaultProps: {
    TabIndicatorProps: {
      hidden: true,
    },
  },
  styleOverrides: {
    root: ({ theme }) => ({
      minHeight: 'auto',
      background: theme.palette.grey[200],
      borderRadius: theme.spacing(3),
      padding: theme.spacing(1),
    }),
    flexContainer: ({ theme }) => ({
      gap: theme.spacing(2),
    }),
  },
};

export const tabTheme: Components<Theme>['MuiTab'] = {
  defaultProps: {
    LinkComponent: LinkBehaviour,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      ...typographyCustomTheme.BodyMMedium,
      minHeight: 'auto',

      padding: theme.spacing(2.5),
      borderRadius: theme.shape.borderRadius,
      color: theme.palette.text.secondary,
      textTransform: 'none',
      '&:hover': {
        color: theme.palette.grey[400],
      },
      '&.Mui-selected': {
        color: theme.palette.text.primary,
        background: theme.palette.common.white,
        borderRadius: theme.spacing(2.25),
      },
    }),
  },
};
