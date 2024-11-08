import { SvgIcon, SvgIconProps } from '@mui/material';

export const ArrowLeftIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M21 12L16 7M21 12L16 17M21 12H3"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
