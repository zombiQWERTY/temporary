import { AddressDetailsForm } from '@/features/profiles';
import { ProfileRoutes } from '@/shared/router';
import { ProfileWrapper } from '../../ProfileWrapper';

export const ResidenceAddress = () => {
  return (
    <ProfileWrapper activeHref={ProfileRoutes.Location}>
      <AddressDetailsForm />
    </ProfileWrapper>
  );
};
