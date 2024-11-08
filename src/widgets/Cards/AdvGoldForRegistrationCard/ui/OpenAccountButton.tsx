'use client';
import { Button, Link } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { AccountRoutes, VerificationRoutes } from '@/shared/router';

export const OpenAccountButton = () => {
  const user = useUser();
  const t = useTranslations('Widgets.AdvGoldForRegistrationCard');

  return (
    <Button
      component={Link}
      href={
        user.data?.accountStatus === AccountStatusEnum.Verified
          ? AccountRoutes.Base
          : VerificationRoutes.PassportDetails
      }
      variant="secondary"
    >
      {t('open_account')}
    </Button>
  );
};
