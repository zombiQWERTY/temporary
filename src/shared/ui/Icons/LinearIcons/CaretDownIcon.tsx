import { SvgIcon, SvgIconProps } from '@mui/material';

export const CaretDownIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} fill="none">
    <path
      d="M16 10L12 14L8 10"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
