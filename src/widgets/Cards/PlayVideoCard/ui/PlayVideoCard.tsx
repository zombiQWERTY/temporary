'use client';
import { useTranslations } from 'next-intl';
import { useShowPlayVideoModal } from '@/widgets/Cards/PlayVideoCard/lib/useShowPlayVideoModal';
import { CardBase, PlayCircleIcon } from '@/shared/ui';

export const PlayVideoCard = () => {
  const t = useTranslations('Widgets.PlayVideoCard');

  const { showModal } = useShowPlayVideoModal();

  return (
    <CardBase
      onClick={showModal}
      icon={<PlayCircleIcon fontSize="large" />}
      title={t('watch_video')}
      titleDescription={t('steps_left', { steps: 1 })}
      subTitleDescription={t('about_minutes', { min: 15 })}
    />
  );
};
