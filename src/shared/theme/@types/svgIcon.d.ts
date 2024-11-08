import type {} from '@mui/material/styles';

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsSizeOverrides {
    extraLarge: true;
    xxl: true;
    xxxl: true;
    xxxxl: true;
  }
}
