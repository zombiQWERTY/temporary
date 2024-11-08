import { useTranslations } from 'next-intl';

import { AccountRoutes } from '@/shared/router';
import {
  SortVerticalIcon,
  WithdrawIcon,
  ReceiveIcon,
  ReloadIcon,
  PlusIcon,
} from '@/shared/ui';

export const useAccountActionItem = () => {
  const t = useTranslations('Features.Accounts.ActionItems');

  return {
    [AccountRoutes.Deposit]: {
      icon: <PlusIcon fontSize="large" />,
      title: t('deposit'),
      subTitle: t('top_up_account'),
    },
    [AccountRoutes.TransferBetweenAccounts]: {
      icon: <SortVerticalIcon fontSize="large" />,
      title: t('between_accounts'),
      subTitle: t('transfer_between_accounts'),
    },
    [AccountRoutes.P2PTransfer]: {
      icon: <ReceiveIcon fontSize="large" color="inherit" />,
      title: t('transfer'),
      subTitle: t('to_internal_account'),
    },
    [AccountRoutes.Change]: {
      icon: <ReloadIcon fontSize="large" />,
      title: t('exchange'),
      subTitle: t('exchange_currency'),
    },
    [AccountRoutes.Withdraw]: {
      icon: <WithdrawIcon fontSize="large" />,
      title: t('withdraw'),
      subTitle: t('withdraw_money'),
    },
  };
};
