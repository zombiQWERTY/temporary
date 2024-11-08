import { Grid, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { PaymentsAndTransfersCard } from '@/widgets/AccountActions';
import { RecentTransactions } from '@/widgets/RecentTransactions';
import { AccountsTable } from '@/features/accounts';
import { GetMyAccountsApi } from '@/entities/Accounts';
import { GetRecentTransactionsApi } from '@/entities/Transactions';

interface ListProps {
  initialAccountsData: GetMyAccountsApi.GetMyAccountsDtoSchema | null;
  initialRecentTransactionsData: GetRecentTransactionsApi.GetRecentTransactionsDtoSchema | null;
}

export const List = (props: ListProps) => {
  const t = useTranslations('Accounts');

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            pt: 13,
            pb: 8,
            px: 6,
          }}
        >
          <Typography variant="Heading05">{t('Common.page_title')}</Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            px: 6,
          }}
        >
          <AccountsTable initialAccountsData={props.initialAccountsData} />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={5}
        sx={{
          pt: 5,
          pb: 8,
          px: 6,
        }}
      >
        <Grid item xs={12} lg={6}>
          <RecentTransactions
            initialRecentTransactionsData={props.initialRecentTransactionsData}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <PaymentsAndTransfersCard />
        </Grid>
      </Grid>
    </>
  );
};
