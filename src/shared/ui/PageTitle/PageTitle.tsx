import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { BackButton } from '@/shared/ui';

export interface TitleButtonProps {
  title?: string;
  href?: Url;
  variant?: 'Heading06' | 'Heading05';
  compact?: boolean;
  bottomSlot?: ReactNode;
}

export const PageTitle = ({
  title,
  href,
  variant = 'Heading05',
  compact = false,
  bottomSlot,
}: TitleButtonProps) => (
  <Stack
    direction="row"
    alignItems="center"
    gap={compact ? 4 : 6}
    mb={compact ? 0 : 12}
    sx={{ textDecoration: 'none' }}
  >
    {href && <BackButton href={href} />}

    {title && (
      <Typography variant={variant} color="grey.900">
        {title}
      </Typography>
    )}

    {bottomSlot}
  </Stack>
);
