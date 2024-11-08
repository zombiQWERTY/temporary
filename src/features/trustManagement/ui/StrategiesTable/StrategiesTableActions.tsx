'use client';

import { Stack, Button } from '@mui/material';

import { useTranslations } from 'next-intl';
import { PointerEvent } from 'react';
import { CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { useShowInvestFormModal } from '../../lib/useShowInvestFormModal';

interface AccountsTableActionsProps {
  id: number;
  strategyCurrency: CurrencyCodesEnum;
}

export const StrategiesTableActions = ({
  id,
  strategyCurrency,
}: AccountsTableActionsProps) => {
  const t = useTranslations('Features.Strategies');

  const { showModal } = useShowInvestFormModal(id, strategyCurrency);

  const handleClick = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    showModal();
  };

  return (
    <Stack direction="row" gap={6} alignItems="center">
      <Button
        variant="contained"
        size="medium"
        onClick={handleClick}
        sx={{ padding: '10px 70px' }}
      >
        {t('invest')}
      </Button>
    </Stack>
  );
};
