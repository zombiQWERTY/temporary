import { SvgIcon, SvgIconProps } from '@mui/material';

export const ArrowUpIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M12 3L7 8M12 3L17 8M12 3V21"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
