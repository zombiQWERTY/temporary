import { SvgIcon, SvgIconProps } from '@mui/material';

export const ArrowDownIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M12 21L17 16M12 21L7 16M12 21V3"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
