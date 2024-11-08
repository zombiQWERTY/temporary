import { SvgIcon, SvgIconProps } from '@mui/material';

export const CaretUpIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M8 14L12 10L16 14"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
