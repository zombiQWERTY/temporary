import { SvgIcon, SvgIconProps } from '@mui/material';

export const ChevronDownIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M19 9L12 16L5 9"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
