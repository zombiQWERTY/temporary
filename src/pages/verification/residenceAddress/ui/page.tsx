import { useTranslations } from 'next-intl';

import { VerificationSection } from '@/features/verifications';
import { ResidenceAddressForm } from '@/features/verifications/ResidenceAddressForm';

export const ResidenceAddress = () => {
  const t = useTranslations('Verification');

  return (
    <VerificationSection title={t('Stepper.residence_address')}>
      <ResidenceAddressForm />
    </VerificationSection>
  );
};
