import { SvgIcon, SvgIconProps } from '@mui/material';

export const CaretRightIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M10 8L14 12L10 16"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
