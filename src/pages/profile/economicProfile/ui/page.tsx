import { EconomicProfileForm } from '@/features/profiles';
import { ProfileRoutes } from '@/shared/router';
import { ProfileWrapper } from '../../ProfileWrapper';

export const EconomicProfile = () => {
  return (
    <ProfileWrapper activeHref={ProfileRoutes.Economic}>
      <EconomicProfileForm />
    </ProfileWrapper>
  );
};
