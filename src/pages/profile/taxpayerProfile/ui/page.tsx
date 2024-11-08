import { TaxpayerProfileForm } from '@/features/profiles';
import { ProfileRoutes } from '@/shared/router';
import { ProfileWrapper } from '../../ProfileWrapper';

export const TaxpayerProfile = () => {
  return (
    <ProfileWrapper activeHref={ProfileRoutes.Tax}>
      <TaxpayerProfileForm />
    </ProfileWrapper>
  );
};
