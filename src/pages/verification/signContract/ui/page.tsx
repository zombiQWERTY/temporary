import { useTranslations } from 'next-intl';

import { VerificationSection } from '@/features/verifications';
import { SignContractForm } from '@/features/verifications';

export const SignContract = () => {
  const t = useTranslations('Verification.Common');

  return (
    <VerificationSection
      title={t('sign_contract_title')}
      subtitle={t('sign_contract_title_subtitle')}
    >
      <SignContractForm />
    </VerificationSection>
  );
};
