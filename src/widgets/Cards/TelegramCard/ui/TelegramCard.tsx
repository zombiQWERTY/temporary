import { useTranslations } from 'next-intl';
import { TelegramIcon, CardBase } from '@/shared/ui';

export const TelegramCard = () => {
  const t = useTranslations('Widgets.TelegramCard');
  return (
    <CardBase
      icon={<TelegramIcon fontSize="large" />}
      title={t('subscribe_telegram')}
      titleDescription={t('steps_left', { steps: 1 })}
      subTitleDescription={t('about_minutes', { min: 1 })}
    />
  );
};
