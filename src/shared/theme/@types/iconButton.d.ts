import type {} from '@mui/material/styles';

declare module '@mui/material/IconButton' {
  interface IconButtonOwnProps {
    variant?:
      | 'standard'
      | 'outlineSquare'
      | 'outlineRound'
      | 'filledSquare'
      | 'filledRound';
  }

  interface IconButtonClasses {
    sizeExtraSmall: string;
    sizeExtraLarge: string;
  }

  interface IconButtonPropsSizeOverrides {
    extraLarge: true;
    extraSmall: true;
  }
}
