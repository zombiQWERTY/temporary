import { useTranslations } from 'next-intl';

import { VerificationRoutes } from '@/shared/router';
import { UserIdIcon, CardBase } from '@/shared/ui';

export const GoVerificationCard = () => {
  const t = useTranslations('Widgets.GoVerificationCard');

  return (
    <CardBase
      href={VerificationRoutes.PassportDetails}
      icon={<UserIdIcon fontSize="large" />}
      title={t('go_through_verification')}
      titleDescription={t('steps_left', { steps: 6 })}
      subTitleDescription={t('about_minutes', { min: 15 })}
    />
  );
};
