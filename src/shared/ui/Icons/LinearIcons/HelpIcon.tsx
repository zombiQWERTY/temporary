import { SvgIcon, SvgIconProps } from '@mui/material';

export const HelpIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
    />
    <path d="M15 9L19 5" stroke="currentColor" fill="none" strokeWidth="2" />
    <path d="M5 19L9 15" stroke="currentColor" fill="none" strokeWidth="2" />
    <path d="M9 9L5 5" stroke="currentColor" fill="none" strokeWidth="2" />
    <path d="M19 19L15 15" stroke="currentColor" fill="none" strokeWidth="2" />
  </SvgIcon>
);
