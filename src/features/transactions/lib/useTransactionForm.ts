import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useAccountType, GetMyAccountsApi } from '@/entities/Accounts';
import {
  CurrencyCodesEnum,
  AccountTypeEnum,
} from '@/shared/commonProjectParts';

interface UseTransactionFormProps {
  selectedAccount?: number;
  useMasterAccount?: boolean;
  accounts: GetMyAccountsApi.GetMyAccountsDtoSchema | undefined;
  selectedCurrency: CurrencyCodesEnum;
}

export const useTransactionForm = ({
  selectedAccount,
  selectedCurrency,
  accounts,
  useMasterAccount = false,
}: UseTransactionFormProps) => {
  const t = useTranslations('Features.Transactions.Forms.Common');
  const accountTypes = useAccountType();

  const account = useMemo(() => {
    return accounts?.list?.find((a) =>
      useMasterAccount
        ? a.accountType === AccountTypeEnum.Master
        : a.id === selectedAccount,
    );
  }, [accounts, useMasterAccount, selectedAccount]);

  const selectedSubAccount = useMemo(() => {
    return account?.subAccounts.find(
      (a) => a.currencyCode === selectedCurrency,
    );
  }, [account, selectedCurrency]);

  const selectedSubAccounts = useMemo(() => {
    return account?.subAccounts || [];
  }, [account]);

  const accountOptions = useMemo(() => {
    return (
      accounts?.list?.map((a) => ({
        id: a.id,
        label: t('account_info', {
          accountType: accountTypes[a.accountType],
          id: a?.walletNumber?.walletId,
        }),
      })) || []
    );
  }, [accounts, accountTypes, t]);

  return {
    accountOptions,
    selectedSubAccounts,
    selectedSubAccount,
  };
};
