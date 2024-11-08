import { PaletteOptions } from '@mui/material';

import { red, green, blue, mono } from '../colors';

export const lightPalette: PaletteOptions = {
  common: {
    black: mono[900],
    white: mono[0],
  },
  primary: {
    main: blue[500],
    dark: blue[600],
    light: blue[400],
  },
  secondary: {
    main: blue[100],
    dark: blue[300],
    light: blue[200],
  },
  error: {
    main: red[400],
    dark: red[500],
    light: red[100],
  },
  // warning: {},
  info: {
    main: blue[500],
  },
  success: {
    main: green[400],
  },
  text: {
    primary: mono[800],
    secondary: mono[300],
    disabled: mono[300],
  },
  divider: mono[100],
  grey: {
    50: mono[50],
    100: mono[100],
    200: mono[200],
    300: mono[300],
    400: mono[400],
    500: mono[500],
    600: mono[600],
    700: mono[700],
    800: mono[800],
    900: mono[900],
  },
  action: {
    // active: string;
    // hover: string;
    // hoverOpacity: number;
    // selected: string;
    // selectedOpacity: number;
    // disabled: string;
    // disabledOpacity: number;
    // disabledBackground: string;
    // focus: string;
    // focusOpacity: number;
    // activatedOpacity: number;
  },
  background: {
    paper: mono[0],
    default: mono[50],
  },
};
