'use client';
import { useTranslations } from 'next-intl';

import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { AccountRoutes, VerificationRoutes } from '@/shared/router';
import { CardSendIcon, CardBase } from '@/shared/ui';

export const TopAccountCard = () => {
  const t = useTranslations('Widgets.TopAccountCard');
  const { data: user } = useUser();

  const href =
    user?.accountStatus === AccountStatusEnum.Verified
      ? AccountRoutes.Base
      : VerificationRoutes.PassportDetails;

  return (
    <CardBase
      icon={<CardSendIcon fontSize="large" />}
      href={href}
      title={t('top_account')}
      titleDescription={t('steps_left', { steps: 1 })}
      subTitleDescription={t('about_minutes', { min: 15 })}
    />
  );
};
