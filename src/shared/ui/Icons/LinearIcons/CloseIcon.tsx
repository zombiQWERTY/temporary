import { SvgIcon, SvgIconProps } from '@mui/material';

export const CloseIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
