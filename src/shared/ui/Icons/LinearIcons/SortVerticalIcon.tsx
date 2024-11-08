import { SvgIcon, SvgIconProps } from '@mui/material';

export const SortVerticalIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M16 18L16 6M16 6L20 10.125M16 6L12 10.125"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6L8 18M8 18L12 13.875M8 18L4 13.875"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
