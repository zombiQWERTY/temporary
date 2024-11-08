import { SvgIcon, SvgIconProps } from '@mui/material';

export const ChevronLeftIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M15 19L8 12L15 5"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
