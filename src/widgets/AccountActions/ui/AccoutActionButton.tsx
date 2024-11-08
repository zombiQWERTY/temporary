import { Box, Link, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface AccountActionButtonProps {
  icon: ReactNode;
  title: string;
  route: string;
}

export const AccountActionButton = ({
  icon,
  title,
  route,
}: AccountActionButtonProps) => {
  return (
    <Stack
      gap={4}
      alignItems="center"
      component={Link}
      href={route}
      color="inherit"
      underline="none"
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (theme) => theme.palette.grey[50],
          borderRadius: '100%',
          padding: '6px',
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ textAlign: 'center' }}>{title}</Typography>
    </Stack>
  );
};
