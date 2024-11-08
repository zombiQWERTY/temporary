import type { Components, Theme } from '@mui/material';

export const svgIconTheme: Components<Theme>['MuiSvgIcon'] = {
  defaultProps: {
    fontSize: 'inherit',
  },
  styleOverrides: {},
  variants: [
    {
      props: { fontSize: 'small' },
      style: {
        fontSize: 16,
      },
    },
    {
      props: { fontSize: 'medium' },
      style: {
        fontSize: 20,
      },
    },
    {
      props: { fontSize: 'large' },
      style: {
        fontSize: 24,
      },
    },
    {
      props: { fontSize: 'extraLarge' },
      style: {
        fontSize: 40,
      },
    },
  ],
};
