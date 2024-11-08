import { SvgIcon, SvgIconProps } from '@mui/material';

export const ChevronRightIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M9 5L16 12L9 19"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
