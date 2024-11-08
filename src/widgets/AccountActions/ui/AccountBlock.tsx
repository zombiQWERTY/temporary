'use client';
import { Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

import {
  useAccountType,
  useGetAccountById,
  GetAccountByIdApi,
} from '@/entities/Accounts';
import { AccountRoutes } from '@/shared/router';
import { PageTitle } from '@/shared/ui';
import { AccountActions } from './AccountActions';
import { AccountCard } from './AccountCard';

interface AccountBlockProps {
  initialAccountData: GetAccountByIdApi.GetMyAccountByIdDtoSchema | null;
  accountId: number | string;
}

export const AccountBlock = ({
  accountId,
  initialAccountData,
}: AccountBlockProps) => {
  const t = useTranslations('Widgets.AccountActions.AccountBlock');

  const account = useGetAccountById({
    accountId,
    initialData: initialAccountData,
  });

  const accountTypes = useAccountType();

  const accountType = accountTypes[account.response.account.accountType];

  const accountTitle = accountType
    ? `${accountType} ${account.response.account?.walletNumber?.walletId}`
    : t('loading');

  return (
    <>
      <PageTitle title={accountTitle} href={AccountRoutes.Base} />

      <Grid container columnSpacing={12} mt={12}>
        <Grid item xs={12} sm={8} md={5} lg={5} lgp={4} xl={4} xxl={3}>
          <AccountCard
            account={account.response.account}
            title={accountTitle || t('loading')}
          />
        </Grid>

        <Grid item xs={12} md={12} lg={7} lgp={7} xl={7} xxl={5}>
          <AccountActions />
        </Grid>
      </Grid>
    </>
  );
};
