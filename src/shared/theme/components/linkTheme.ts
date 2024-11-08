import { type Components, type Theme } from '@mui/material';
import { LinkBehaviour } from './LinkBehaviour';

export const linkTheme: Components<Theme>['MuiLink'] = {
  defaultProps: {
    component: LinkBehaviour,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.primary.main,
      '&:hover': {
        color: theme.palette.primary.dark,
      },
      '&[disabled]': {
        color: theme.palette.primary.dark,
        pointerEvents: 'none',
      },
    }),
  },
};
