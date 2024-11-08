import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useCallback } from 'react';
import { useModal } from 'react-modal-hook';

import { ServerError } from '@/shared/api';
import { useToast } from '@/shared/lib';
import { Dialog } from '@/shared/ui';

interface UseShowConfirmModalProps {
  handleOnSave: () => Promise<any>;
  handleOnCancel: () => Promise<any> | void;
}

export const useShowConfirmModal = ({
  handleOnSave,
  handleOnCancel,
}: UseShowConfirmModalProps) => {
  const [showConfirmModal, hideConfirmModal] = useModal(
    (modalProps) => {
      // Modals are also functional components and can use React hooks themselves:
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const t = useTranslations('Shared.DataTable');
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const toast = useToast();

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const onSave = useCallback(async () => {
        try {
          await handleOnSave();
          toast.success(t('delete_succeed'));
        } catch (e: unknown) {
          const { error } = e as ServerError;
          toast.error(error);
          toast.error(t('delete_errored'));
        } finally {
          hideConfirmModal();
        }
      }, [t, toast]);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const onClose = useCallback(() => {
        hideConfirmModal();
        handleOnCancel();
      }, []);

      return (
        <Dialog
          onClose={onClose}
          title={t('delete_modal_title')}
          footerSlot={
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={onClose}
                sx={{ marginRight: '10px' }}
              >
                {t('cancel')}
              </Button>
              <Button size="small" type="submit" onClick={onSave}>
                {t('delete')}
              </Button>
            </>
          }
          {...modalProps}
        >
          {t('delete_modal_description')}
        </Dialog>
      );
    },
    [handleOnSave, handleOnCancel],
  );

  return { showConfirmModal, hideConfirmModal };
};
