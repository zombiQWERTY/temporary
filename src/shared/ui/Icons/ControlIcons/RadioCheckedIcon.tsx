import { SvgIcon, SvgIconProps } from '@mui/material';

export const RadioCheckedIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <rect width="24" height="24" rx="12" fill="currentColor" />
    <rect x="6" y="6" width="12" height="12" rx="6" fill="white" />
  </SvgIcon>
);
