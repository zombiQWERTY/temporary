import type { Components, Theme } from '@mui/material';
import { typographyCustomTheme } from './typographyCustomTheme';

export const menuItemTheme: Components<Theme>['MuiMenuItem'] = {
  defaultProps: {
    color: 'primary',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      ...typographyCustomTheme.BodyMRegular,
      color: theme.palette.text.primary,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      '&:hover': {
        background: theme.palette.grey[50],
      },
      '&.Mui-selected:hover': {
        background: theme.palette.grey[50],
      },
      '&.Mui-selected': {
        background: 'inherit',
      },
    }),
  },
};
