'use client';

import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useShowDepositRequestFormModal } from '@/features/transactions';

export const OpenModalButton = () => {
  const t = useTranslations('DepositByDetails');

  const { showModal } = useShowDepositRequestFormModal();

  return (
    <Button variant="contained" size="medium" onClick={showModal}>
      {t('Confirmations.confirmation_of_opening_brokerage_agreement')}
    </Button>
  );
};
