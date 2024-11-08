'use client';
import { Stack, Button, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PointerEvent } from 'react';

import { GetInvestmentsApi } from '@/entities/TrustManagements';
import { DocumentsIcon } from '@/shared/ui';
import { useShowInvestFormModal } from '../../lib/useShowInvestFormModal';
import { useShowWithdrawFormModal } from '../../lib/useShowWithdrawFormModal';

interface AccountsTableActionsProps {
  investment: GetInvestmentsApi.InvestmentSchema;
}

export const InvestmentsTableActions = ({
  investment,
}: AccountsTableActionsProps) => {
  const t = useTranslations('Features.Investments');

  const { showModal: showInvestModal } = useShowInvestFormModal(
    investment.strategyId,
    investment.strategyCurrency,
  );

  const { showModal: showWithdrawModal } = useShowWithdrawFormModal(investment);

  const handleInvestClick = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    showInvestModal();
  };

  const handleWithdrawClick = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    showWithdrawModal();
  };

  const handleDocumentsClick = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <Stack direction="row" gap={6} alignItems="center">
      <Button
        variant="contained"
        size="medium"
        onClick={handleInvestClick}
        sx={{ padding: '10px 16px' }}
      >
        {t('invest')}
      </Button>
      <Button
        variant="contained"
        size="medium"
        onClick={handleWithdrawClick}
        sx={{ padding: '10px 16px' }}
      >
        {t('withdraw')}
      </Button>
      <IconButton variant="standard" onClick={handleDocumentsClick}>
        <DocumentsIcon
          sx={{ color: (theme) => theme.palette.text.secondary }}
        />
      </IconButton>
    </Stack>
  );
};
