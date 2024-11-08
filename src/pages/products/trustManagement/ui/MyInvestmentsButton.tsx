'use client';

import { Button, Link } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { TrustManagementRoutes, VerificationRoutes } from '@/shared/router';

interface MyInvestmentsButtonProps {
  active?: boolean;
}
export const MyInvestmentsButton = ({
  active = false,
}: MyInvestmentsButtonProps) => {
  const { data: user } = useUser();
  const t = useTranslations('TrustManagement');

  return (
    <Link
      href={
        user?.accountStatus === AccountStatusEnum.Verified
          ? TrustManagementRoutes.Investments
          : VerificationRoutes.PassportDetails
      }
    >
      <Button
        variant="ghost"
        size="medium"
        sx={{
          background: active
            ? (theme) => theme.palette.secondary.main
            : undefined,
        }}
      >
        {t('my_investments')}
      </Button>
    </Link>
  );
};
