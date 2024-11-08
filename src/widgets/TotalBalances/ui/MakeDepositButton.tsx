import { Button, Link } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { AccountRoutes, VerificationRoutes } from '@/shared/router';
import { PlusIcon } from '@/shared/ui';

export const MakeDepositButton = () => {
  const { data: user } = useUser();
  const t = useTranslations('Widgets.TotalBalances');

  return (
    <Link
      href={
        user?.accountStatus === AccountStatusEnum.Verified
          ? AccountRoutes.Deposit
          : VerificationRoutes.PassportDetails
      }
    >
      <Button
        size="small"
        startIcon={<PlusIcon />}
        sx={{
          display: { xs: 'none', lg: 'flex' },
        }}
      >
        {t('make_deposit')}
      </Button>
    </Link>
  );
};
