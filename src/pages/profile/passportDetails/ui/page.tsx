import { PassportDetailsForm } from '@/features/profiles';
import { ProfileRoutes } from '@/shared/router';
import { ProfileWrapper } from '../../ProfileWrapper';

export const PassportDetails = () => {
  return (
    <ProfileWrapper activeHref={ProfileRoutes.Identity}>
      <PassportDetailsForm />
    </ProfileWrapper>
  );
};
