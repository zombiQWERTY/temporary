import { useTranslations } from 'next-intl';
import { VerificationStageEnum } from '@/shared/commonProjectParts';
import { VerificationRoutes } from '@/shared/router';
import { CardProgressBase } from '@/shared/ui';

const validTransitions: {
  [key in VerificationStageEnum]?: string;
} = {
  [VerificationStageEnum.Passport]: VerificationRoutes.PassportDetails,
  [VerificationStageEnum.Residence]: VerificationRoutes.ResidenceAddress,
  [VerificationStageEnum.Economic]: VerificationRoutes.EconomicProfile,
  [VerificationStageEnum.Taxpayer]: VerificationRoutes.TaxpayerDetails,
  [VerificationStageEnum.Contract]: VerificationRoutes.SignContract,
};

const stagesKeys = Object.keys(validTransitions);

interface CompleteVerificationCardProps {
  currentStage: VerificationStageEnum;
}

export const CompleteVerificationCard = ({
  currentStage,
}: CompleteVerificationCardProps) => {
  const t = useTranslations('Widgets.CompleteVerificationCard');

  const currentStageIndex = currentStage
    ? stagesKeys.findIndex((s) => s === currentStage) || 0
    : 0;

  const wait = currentStageIndex + 1 === stagesKeys.length;

  return (
    <CardProgressBase
      title={
        wait ? t('wait_for_profile_confirmation') : t('complete_verification')
      }
      progress={((currentStageIndex + 1) / stagesKeys.length) * 100}
      progressTitle={t('verification_step', {
        step: currentStageIndex + 1,
        count: stagesKeys.length,
      })}
      subTitle={t('use_service_completely')}
      hasLink={!wait}
      href={currentStage ? validTransitions[currentStage]! : '#'}
    />
  );
};
