import { SvgIcon, SvgIconProps } from '@mui/material';

export interface RadioIconProps extends SvgIconProps {
  backgroundColor?: string;
}

export const RadioIcon = ({ backgroundColor, ...props }: RadioIconProps) => (
  <SvgIcon {...props}>
    <rect
      x="0.5"
      y="0.5"
      width="23"
      height="23"
      rx="11.5"
      stroke="currentColor"
    />
    <rect
      x="0.5"
      y="0.5"
      width="23"
      height="23"
      rx="11.5"
      fill={backgroundColor}
    />
  </SvgIcon>
);
