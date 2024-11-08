import type {} from '@mui/material/styles';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    main: true;
    secondary: true;
    linear: true;
    ghost: true;
  }
}
