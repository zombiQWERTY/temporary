import { SvgIcon, SvgIconProps } from '@mui/material';

export const ChevronUpIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M5 16L12 9L19 16"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
