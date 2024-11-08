'use client';
import { useTranslations } from 'next-intl';
import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { AccountRoutes, VerificationRoutes } from '@/shared/router';
import { StarFallIcon } from '@/shared/ui';
import { CardBase } from '@/shared/ui';

export const SelectProductCard = () => {
  const t = useTranslations('Widgets.SelectProductCard');
  const { data: user } = useUser();

  const href =
    user?.accountStatus === AccountStatusEnum.Verified
      ? AccountRoutes.Base
      : VerificationRoutes.PassportDetails;

  return (
    <CardBase
      href={href}
      icon={<StarFallIcon fontSize="large" />}
      title={t('select_product')}
      titleDescription={t('steps_left', { steps: 2 })}
      subTitleDescription={t('about_minutes', { min: 5 })}
    />
  );
};
