import { useTranslations } from 'next-intl';
import { AccountTypeEnum } from '@/shared/commonProjectParts';

export const useAccountType = () => {
  const t = useTranslations('Common.AccountTypes');

  return {
    [AccountTypeEnum.Master]: t('master'),
    [AccountTypeEnum.Savings]: t('savings'),
  } as const;
};
