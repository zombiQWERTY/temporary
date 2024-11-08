import { Grid } from '@mui/material';

import { AccountBlock } from '@/widgets/AccountActions';
import { RecentTransactions } from '@/widgets/RecentTransactions';
import { GetAccountByIdApi } from '@/entities/Accounts';
import { GetRecentTransactionsApi } from '@/entities/Transactions';

interface SingleProps {
  accountId: number | string;
  initialAccountData: GetAccountByIdApi.GetMyAccountByIdDtoSchema | null;
  initialRecentTransactionsData: GetRecentTransactionsApi.GetRecentTransactionsDtoSchema | null;
}

export const Single = ({
  initialRecentTransactionsData,
  initialAccountData,
  accountId,
}: SingleProps) => {
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
          <AccountBlock
            initialAccountData={initialAccountData}
            accountId={accountId}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={5}
        sx={{
          pt: 4,
          pb: 8,
          px: 6,
        }}
      >
        <Grid item xs={12} lg={6}>
          <RecentTransactions
            accountId={initialAccountData?.account.id}
            initialRecentTransactionsData={initialRecentTransactionsData}
          />
        </Grid>
        <Grid item xs={12} lg={6}></Grid>
      </Grid>
    </>
  );
};
