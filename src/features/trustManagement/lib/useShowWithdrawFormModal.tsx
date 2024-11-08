'use client';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useModal } from 'react-modal-hook';

import { GetInvestmentsApi } from '@/entities/TrustManagements';
import { Dialog } from '@/shared/ui';
import { WithdrawForm } from '../ui/WithdrawForm/WithdrawForm';

export const useShowWithdrawFormModal = (
  investment: GetInvestmentsApi.InvestmentSchema,
) => {
  const t = useTranslations('Features.Strategies.Forms.Withdraw');

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <Dialog
        open={open}
        onClose={hideModal}
        TransitionProps={{ onExited }}
        title={t('application_to_exit_strategy')}
      >
        <Box sx={{ minWidth: '344px' }}>
          <WithdrawForm closeModal={hideModal} investment={investment} />
        </Box>
      </Dialog>
    ),
    [t, investment],
  );

  return { showModal, hideModal };
};
