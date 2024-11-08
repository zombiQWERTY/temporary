import { Box, Typography, Grid, Stack } from '@mui/material';

import { BalanceItem } from '@/features/accounts';
import { GetAccountByIdApi, useSortBalances } from '@/entities/Accounts';
import { AccountTypeEnum } from '@/shared/commonProjectParts';

import masterBg from './images/masterBg.svg';
import savingsBg from './images/savingsBg.svg';

export interface AccountCardProps {
  account: GetAccountByIdApi.AccountSchema | null;
  title: string;
}

const accountCardImages = {
  [AccountTypeEnum.Master]: `url(${masterBg.src})`,
  [AccountTypeEnum.Savings]: `url(${savingsBg.src})`,
};

const defaultCardImage = accountCardImages[AccountTypeEnum.Master];

export const AccountCard = ({ account, title }: AccountCardProps) => {
  const balancesMap = useSortBalances({ balances: account?.subAccounts || [] });

  return (
    <Box
      sx={{
        backgroundImage: account
          ? accountCardImages[account.accountType] || defaultCardImage
          : defaultCardImage,
        minHeight: '176px',
        backgroundPosition: 'top',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        borderRadius: 4,
        padding: 6,
      }}
    >
      <Stack gap={6}>
        <Typography variant="Heading07" color="common.white">
          {title}
        </Typography>

        <Grid container spacing={6}>
          {balancesMap.map((item) => (
            <Grid item key={item.currencyCode} xs={6}>
              <BalanceItem
                balance={item.balance}
                currencyCode={item.currencyCode}
                variant="BodyMSemibold"
                color="common.white"
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};
