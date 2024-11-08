import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useModal } from 'react-modal-hook';

import { Dialog } from '@/shared/ui';

export const useShowPlayVideoModal = () => {
  const t = useTranslations('Widgets.PlayVideoCard');

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <Dialog
        open={open}
        onClose={hideModal}
        TransitionProps={{ onExited }}
        title={t('video_title')}
        subTitle={t('video_subtitle')}
      >
        <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=bTo_Y4o-pIkrEn1X"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </Box>
      </Dialog>
    ),
    [t],
  );

  return { showModal, hideModal };
};
