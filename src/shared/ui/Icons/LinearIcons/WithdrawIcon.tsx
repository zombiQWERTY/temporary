import { SvgIcon, SvgIconProps } from '@mui/material';

export const WithdrawIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="transparent"
    />
    <path
      d="M12 14L12 4M12 4L9 7M12 4L15 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
