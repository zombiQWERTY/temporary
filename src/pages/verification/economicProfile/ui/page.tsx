import { useTranslations } from 'next-intl';

import {
  EconomicProfileForm,
  VerificationSection,
} from '@/features/verifications';

export const EconomicProfile = () => {
  const t = useTranslations('Verification');

  return (
    <VerificationSection title={t('Stepper.economic_profile')}>
      <EconomicProfileForm />
    </VerificationSection>
  );
};
