import { Link, LinkProps, Stack } from '@mui/material';
import { ReactNode } from 'react';

export { Link };

export type { LinkProps };

export interface IconLinkProps extends LinkProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export const IconLink = ({
  startAdornment = null,
  children,
  endAdornment = null,
  ...props
}: IconLinkProps) => (
  <Link {...props}>
    <Stack gap={1} direction="row" alignItems="center">
      {startAdornment}
      {children}
      {endAdornment}
    </Stack>
  </Link>
);
