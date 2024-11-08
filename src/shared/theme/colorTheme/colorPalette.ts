import { lightPalette } from './palettes/lightPalette';

export enum ThemeMode {
  Dark = 'dark',
  Light = 'light',
}

export const createColorTheme = () => lightPalette;
