import type {} from '@mui/material/styles';

declare module '@mui/material/Link' {
  interface LinkOwnProps {
    disabled?: boolean;
  }
}
