'use client';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useModal } from 'react-modal-hook';

import { CurrencyCodesEnum } from '@/shared/commonProjectParts';
import { Dialog } from '@/shared/ui';
import { InvestForm } from '../ui/InvestForm/InvestForm';

export const useShowInvestFormModal = (
  strategyId: number,
  strategyCurrency: CurrencyCodesEnum,
) => {
  const t = useTranslations('Features.Strategies.Forms.Invest');

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <Dialog
        open={open}
        onClose={hideModal}
        TransitionProps={{ onExited }}
        title={t('invest_into_strategy')}
      >
        <Box sx={{ minWidth: '344px' }}>
          <InvestForm
            closeModal={hideModal}
            strategyId={strategyId}
            strategyCurrency={strategyCurrency}
          />
        </Box>
      </Dialog>
    ),
    [t, strategyId, strategyCurrency],
  );

  return { showModal, hideModal };
};
