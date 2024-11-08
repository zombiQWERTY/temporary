'use client';

import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useShowInvestFormModal } from '@/features/trustManagement';
import { useUser } from '@/shared/auth';
import {
  AccountStatusEnum,
  CurrencyCodesEnum,
} from '@/shared/commonProjectParts';

interface InvestButtonProps {
  strategyId: number;
  fullWidth?: boolean;
  strategyCurrency: CurrencyCodesEnum;
}
export const InvestButton = ({
  strategyId,
  strategyCurrency,
  fullWidth = false,
}: InvestButtonProps) => {
  const { data: user } = useUser();
  const t = useTranslations('TrustManagement.Strategy');

  const { showModal } = useShowInvestFormModal(strategyId, strategyCurrency);

  if (user?.accountStatus !== AccountStatusEnum.Verified) {
    return null;
  }

  return (
    <Button
      variant="contained"
      size="medium"
      onClick={showModal}
      sx={{ padding: '10px 70px' }}
      fullWidth={fullWidth}
    >
      {t('invest')}
    </Button>
  );
};
