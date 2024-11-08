'use client';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useModal } from 'react-modal-hook';

import { Dialog } from '@/shared/ui';
import { DepositForm } from '../ui/DepositForm/DepositForm';

export const useShowDepositRequestFormModal = () => {
  const t = useTranslations('Features.Transactions.Forms.ExternalDepositForm');

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <Dialog
        open={open}
        onClose={hideModal}
        TransitionProps={{ onExited }}
        title={t('deposit_request')}
      >
        <Box sx={{ minWidth: '344px' }}>
          <DepositForm closeModal={hideModal} />
        </Box>
      </Dialog>
    ),
    [t],
  );

  return { showModal, hideModal };
};
