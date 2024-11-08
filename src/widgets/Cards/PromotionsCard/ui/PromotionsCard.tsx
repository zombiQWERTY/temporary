import { useTranslations } from 'next-intl';
import { SaleIcon, CardBase } from '@/shared/ui';

export const PromotionsCard = () => {
  const t = useTranslations('Widgets.PromotionsCard');
  return (
    <CardBase
      title={t('our_promotions')}
      disabled
      icon={<SaleIcon fontSize="large" />}
      titleDescription={t('completed')}
      subTitleDescription={t('about_minutes', { min: 1 })}
    />
  );
};
