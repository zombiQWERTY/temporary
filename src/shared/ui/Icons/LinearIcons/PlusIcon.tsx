import { SvgIcon, SvgIconProps } from '@mui/material';

export const PlusIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M3.75 12H20.25"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3.75V20.25"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
