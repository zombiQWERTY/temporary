'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useModal } from 'react-modal-hook';

import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { useToast } from '@/shared/lib';
import { Dialog } from '@/shared/ui';
import { OtpTypeEnum, SendEmailCodeApi } from '../../../../entities/Alerts';
import { ConfirmOperationState } from '../model/types';
import { ConfirmOperation } from '../ui/ConfirmOperation';

interface UseShowConfirmPinFormModalProps {
  eventType: OtpTypeEnum;
  onCodeSubmit: (code: string) => void;
}

export const useShowConfirmPinFormModal = ({
  eventType,
  onCodeSubmit,
}: UseShowConfirmPinFormModalProps) => {
  const toast = useToast();
  const { data: user } = useUser();
  const t = useTranslations('Widgets.ConfirmOperationPin');
  const email = user?.auth.email || '';

  const [sentCodeState, setSentCodeState] = useState<ConfirmOperationState>({
    email: null,
  });

  const title = t(
    eventType === OtpTypeEnum.CONFIRM_TRANSACTION
      ? 'confirm_operation'
      : 'confirm',
  );

  const subTitle =
    eventType === OtpTypeEnum.CONFIRM_TRANSACTION
      ? t('confirmation_message', { email })
      : '';

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <Dialog
        open={open}
        onClose={hideModal}
        TransitionProps={{ onExited }}
        title={title}
        subTitle={subTitle}
      >
        <Box sx={{ minWidth: '344px' }}>
          {sentCodeState.email && (
            <ConfirmOperation
              eventType={eventType}
              onSubmitPin={onCodeSubmit}
              state={sentCodeState}
              closeModal={hideModal}
            />
          )}
        </Box>
      </Dialog>
    ),
    [sentCodeState, title, subTitle, eventType],
  );

  const onModalShow = useCallback(async () => {
    try {
      const res = await SendEmailCodeApi.request(
        {
          type: eventType,
          email,
        },
        { hasUser: true },
      );

      setSentCodeState({
        email,
        sentAt: new Date(),
        ttl: res.ttl,
      });

      showModal();
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
    }
  }, [email, eventType, showModal, toast]);

  return { showModal: onModalShow, hideModal };
};
