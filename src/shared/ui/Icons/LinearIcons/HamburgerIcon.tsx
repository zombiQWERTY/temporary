import { SvgIcon, SvgIconProps } from '@mui/material';

export const HamburgerIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M3 17H21M3 12H21M3 7H21"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
