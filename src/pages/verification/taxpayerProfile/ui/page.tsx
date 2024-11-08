import { useTranslations } from 'next-intl';

import { VerificationSection } from '@/features/verifications';
import { TaxPayerDetailForm } from '@/features/verifications/TaxPayerDetailsForm';

export const TaxpayerProfile = () => {
  const t = useTranslations('Verification');

  return (
    <VerificationSection title={t('Stepper.taxpayer_details')}>
      <TaxPayerDetailForm />
    </VerificationSection>
  );
};
