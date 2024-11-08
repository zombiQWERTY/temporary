import { SvgIcon, SvgIconProps } from '@mui/material';

export const SendIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="transparent"
    />
    <path
      d="M10 12H20M20 12L17 9M20 12L17 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
