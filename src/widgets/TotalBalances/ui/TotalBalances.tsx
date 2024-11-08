import { IconButton, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { BalanceItem } from '@/features/accounts';
import { currencySymbolMap, useGetMyBalance } from '@/entities/Accounts';
import { GetMyBalanceApi } from '@/entities/Accounts';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { CurrencyCodes } from '@/shared/commonProjectParts';
import { AccountRoutes } from '@/shared/router';
import { PlusIcon } from '@/shared/ui';
import { MakeDepositButton } from './MakeDepositButton';

interface TotalBalancesProps {
  accountStatus: AccountStatusEnum;
  initialData: GetMyBalanceApi.GetMyBalanceDtoSchema | undefined;
}

export const TotalBalances = ({
  accountStatus,
  initialData,
}: TotalBalancesProps) => {
  const t = useTranslations('Widgets.TotalBalances');

  const { response: balances, isLoading } = useGetMyBalance({
    initialData,
  });

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        textDecoration: 'none',
        gap: { xl: 8, xs: 4 },
        display: { sm: 'none', md: 'flex' },
        color: 'grey.400',
      }}
    >
      <Typography variant="BodyMMedium" color="text.primary">
        {t('balance')}:
      </Typography>

      {accountStatus !== AccountStatusEnum.Verified || isLoading
        ? Object.keys(currencySymbolMap).map((currencyCode) => (
            <BalanceItem
              key={currencyCode}
              balance={BigInt(0)}
              currencyCode={currencyCode as CurrencyCodes}
            />
          ))
        : balances?.map((item) => (
            <BalanceItem
              key={item.currencyCode}
              balance={item.balance}
              currencyCode={item.currencyCode}
            />
          ))}

      <MakeDepositButton />

      <IconButton
        sx={{
          display: { xs: 'flex', lg: 'none' },
        }}
        href={AccountRoutes.Base}
        color="primary"
        variant="filledSquare"
      >
        <PlusIcon />
      </IconButton>
    </Stack>
  );
};
