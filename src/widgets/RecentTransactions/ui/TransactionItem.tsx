import { Stack, Typography, Box, Grid } from '@mui/material';

import { formatMoney, useAccountType } from '@/entities/Accounts';
import {
  GetRecentTransactionsApi,
  OperationTypeEnum,
} from '@/entities/Transactions';
import { useTransactionItemByType } from '../lib/useTransactionItemByType';

export interface TransactionItemProps {
  transaction: GetRecentTransactionsApi.TransactionSchema;
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const transactionsItems = useTransactionItemByType();

  const accountTypes = useAccountType();

  const accountType = accountTypes[transaction.subAccount.account.accountType];

  const transactionItem = transaction?.operationSubType
    ? transactionsItems[transaction.operationSubType]
    : null;

  return (
    <Stack gap={4} direction="row" justifyContent="start">
      <div>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: (theme) => `1px solid ${theme.palette.grey[100]}`,
            borderRadius: '8px',
            padding: '6px',
          }}
        >
          {transactionItem?.icon}
        </Box>
      </div>

      <Grid container justifyContent="space-between" flex={1}>
        <Grid item xs={6}>
          <Stack gap={2}>
            <Typography variant="BodyMMedium">
              {transactionItem?.title ?? ''}
            </Typography>
            <Typography variant="BodySRegular" color="text.secondary">
              {accountType ?? ''}
              {'\u00A0'}
              {transaction.subAccount.account?.walletNumber?.walletId}
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={6}>
          <Stack gap={2} alignItems="flex-end">
            {transaction?.operationType && (
              <Typography
                variant="BodyMMedium"
                color={
                  transaction.operationType === OperationTypeEnum.Deposit
                    ? 'success.main'
                    : 'common.black'
                }
              >
                {transaction.operationType === OperationTypeEnum.Deposit
                  ? '+'
                  : '-'}
                &nbsp;
                {formatMoney(
                  transaction.amount,
                  transaction.subAccount.currencyCode,
                )}
              </Typography>
            )}
            <Typography
              variant="BodySRegular"
              color="text.secondary"
              sx={{ textAlign: 'right' }}
            >
              {transaction.comment}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};
