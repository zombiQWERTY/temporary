import { SvgIcon, SvgIconProps } from '@mui/material';

export interface CheckboxIconProps extends SvgIconProps {
  backgroundColor?: string;
}

export const CheckboxIcon = ({
  backgroundColor,
  ...props
}: CheckboxIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M0.5 8C0.5 3.85786 3.85786 0.5 8 0.5H16C20.1421 0.5 23.5 3.85786 23.5 8V16C23.5 20.1421 20.1421 23.5 16 23.5H8C3.85786 23.5 0.5 20.1421 0.5 16V8Z"
      stroke="currentColor"
    />
    <path
      d="M0.5 8C0.5 3.85786 3.85786 0.5 8 0.5H16C20.1421 0.5 23.5 3.85786 23.5 8V16C23.5 20.1421 20.1421 23.5 16 23.5H8C3.85786 23.5 0.5 20.1421 0.5 16V8Z"
      fill={backgroundColor}
    />
  </SvgIcon>
);
