import { SvgIcon, SvgIconProps } from '@mui/material';

export const CaretLeftIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M14 16L10 12L14 8"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
