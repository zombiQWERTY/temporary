'use client';
import { Typography, Stack, Link } from '@mui/material';
import { ReactNode } from 'react';

import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { AccountRoutes, VerificationRoutes } from '@/shared/router';
import { ChevronRightIcon } from '@/shared/ui';

export interface PaymentMethodItem {
  icon: ReactNode;
  text: string;
}

export const PaymentMethodItem = ({ icon, text }: PaymentMethodItem) => {
  const user = useUser();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      component={Link}
      href={
        user.data?.accountStatus === AccountStatusEnum.Verified
          ? AccountRoutes.Base
          : VerificationRoutes.PassportDetails
      }
      color="inherit"
      underline="none"
      py={4}
      px={6}
      sx={{ '&:hover': { background: (theme) => theme.palette.grey[50] } }}
    >
      <Stack direction="row" gap={4} alignItems="center">
        {icon}
        <Typography>{text}</Typography>
      </Stack>

      <ChevronRightIcon color="primary" fontSize="large" />
    </Stack>
  );
};
