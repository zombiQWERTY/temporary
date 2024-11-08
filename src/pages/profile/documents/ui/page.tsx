import { Documents as Page } from '@/features/profiles';
import { ProfileRoutes } from '@/shared/router';
import { ProfileWrapper } from '../../ProfileWrapper';

export const Documents = () => {
  return (
    <ProfileWrapper activeHref={ProfileRoutes.Documents}>
      <Page />
    </ProfileWrapper>
  );
};
