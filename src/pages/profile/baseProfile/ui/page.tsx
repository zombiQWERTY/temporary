import { PersonalDataForm } from '@/features/profiles';
import { ProfileRoutes } from '@/shared/router';
import { ProfileWrapper } from '../../ProfileWrapper';

export const BaseProfile = () => {
  return (
    <ProfileWrapper activeHref={ProfileRoutes.Base}>
      <PersonalDataForm />
    </ProfileWrapper>
  );
};
