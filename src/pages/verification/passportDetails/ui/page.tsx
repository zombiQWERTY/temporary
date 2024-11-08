import { useTranslations } from 'next-intl';

import { PassportDetailsForm } from '@/features/verifications';
import { VerificationSection } from '@/features/verifications';

export const PassportDetails = () => {
  const t = useTranslations('Verification');

  return (
    <VerificationSection
      title={t('Stepper.passport_details')}
      subtitle={t('Stepper.passport_details_subtitle')}
    >
      <PassportDetailsForm />
    </VerificationSection>
  );
};
