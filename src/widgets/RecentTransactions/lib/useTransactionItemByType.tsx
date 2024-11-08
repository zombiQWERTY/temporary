import { useTranslations } from 'next-intl';

import { OperationSubTypeEnum } from '@/entities/Transactions';
import {
  SortVerticalIcon,
  SendIcon,
  ReceiveIcon,
  ReloadIcon,
  PlusIcon,
} from '@/shared/ui';

export const useTransactionItemByType = () => {
  const t = useTranslations('Features.Transactions');

  return {
    [OperationSubTypeEnum.ExternalDeposit]: {
      icon: <PlusIcon fontSize="large" color="primary" />,
      title: t('debiting'),
    },
    [OperationSubTypeEnum.ExternalWithdrawal]: {
      icon: <SendIcon fontSize="large" color="primary" />,
      title: t('withdrawal'),
    },
    [OperationSubTypeEnum.InternalTransfer]: {
      icon: <SortVerticalIcon fontSize="large" color="primary" />,
      title: t('transfer_between_accounts'),
    },
    [OperationSubTypeEnum.ServiceInternalTransfer]: {
      icon: <SortVerticalIcon fontSize="large" color="primary" />,
      title: t('service'),
    },
    [OperationSubTypeEnum.InternalChange]: {
      icon: <ReceiveIcon fontSize="large" color="primary" />,
      title: t('currency_exchange'),
    },
    [OperationSubTypeEnum.PeerToPeerTransfer]: {
      icon: <ReloadIcon fontSize="large" color="primary" />,
      title: t('transfer_between_accounts'),
    },
    [OperationSubTypeEnum.TransferToStrategy]: {
      icon: <SendIcon fontSize="large" color="primary" />,
      title: t('deposit_tm'),
    },
    [OperationSubTypeEnum.TransferFromStrategy]: {
      icon: <ReceiveIcon fontSize="large" color="primary" />,
      title: t('withdrawal_tm'),
    },
  };
};
