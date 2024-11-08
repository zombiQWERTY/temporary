import { SvgIcon, SvgIconProps } from '@mui/material';

export const ArrowRightIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M3 12L8 17M3 12L8 7M3 12H21"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
