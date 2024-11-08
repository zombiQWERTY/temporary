import { Box, Grid, Stack, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { pathOr } from 'ramda';
import { useMemo } from 'react';

import { formatDateDifference } from '@/features/trustManagement';
import { formatMoney } from '@/entities/Accounts';
import { GetStrategyByIdApi } from '@/entities/TrustManagements';
import { CurrencyCodes } from '@/shared/commonProjectParts';
import { percentageFormat } from '@/shared/lib';
import { MonthlyDrawdownChart } from './charts/MonthlyDrawdownChart';
import { MonthlyProfitabilityChart } from './charts/MonthlyProfitabilityChart';
import { InvestButton } from './InvestButton';

interface ProfitabilityProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

export const Profitability = ({ strategy }: ProfitabilityProps) => {
  const t = useTranslations('TrustManagement.Strategy.Profitability');
  const locale = useLocale();

  const tabData = useMemo(
    () => [
      {
        label: t('profitability'),
        key: 'annualReturnParam',
        formatter: (value: number) => percentageFormat(value, locale),
      },
      {
        label: t('number_of_investors'),
        key: 'advertisedInvestorCount',
      },
      {
        label: t('amount_under_management'),
        key: 'advertisedManagedAmount',
        formatter: (value: number, row: GetStrategyByIdApi.StrategySchema) =>
          formatMoney(value, row.baseCurrency as CurrencyCodes),
      },
      {
        label: t('age'),
        key: 'strategyStartDate',
        formatter: (value: Date) => formatDateDifference(value, t),
      },
      {
        label: t('currency'),
        key: 'baseCurrency',
      },
      {
        label: t('current_share_price'),
        key: 'shares.0.cost',
        formatter: (value: number, row: GetStrategyByIdApi.StrategySchema) =>
          formatMoney(value, row.baseCurrency as CurrencyCodes),
      },
      {
        label: t('maximum_drawdown'),
        key: 'maxDrawdown',
        formatter: (value: number) => percentageFormat(value, locale),
      },
      {
        label: t('sharpe_ratio'),
        key: 'sharpeRatio',
        formatter: (value: number) => value.toFixed(2),
      },
      {
        label: t('profitability_max_drawdown'),
        key: 'returnToMaxDrawdown',
        formatter: (value: number) => value.toFixed(2),
      },
      {
        label: t('average_yield'),
        key: 'averageReturn',
        formatter: (value: number) => percentageFormat(value, locale),
      },
    ],
    [locale, t],
  );

  const renderTabData = (
    key: string,
    label: string,
    value: string | number,
    formatter?: (value: any, row: GetStrategyByIdApi.StrategySchema) => string,
  ) => {
    const formattedValue = formatter ? formatter(value, strategy) : value;
    return (
      <Grid
        key={key}
        container
        sx={{
          py: 6,
          borderBottom: (theme) => `1px solid ${theme.palette.grey[100]}`,
          '&:last-of-type': {
            borderBottomColor: 'transparent',
          },
        }}
      >
        <Grid item xs={8}>
          <Typography variant="BodyMRegular">{label}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="BodyMMedium">{formattedValue}</Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container columnSpacing={{ xs: 5, xxl: 37 }}>
      <Grid item xs={12} lg={6}>
        {tabData.map(({ label, key, formatter }) => {
          const value = pathOr('', key.split('.'), strategy);
          return renderTabData(key, label, value, formatter);
        })}
        <InvestButton
          strategyId={strategy.id}
          strategyCurrency={strategy.baseCurrency}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} lg={6} pt={5}>
        <Stack gap={12}>
          <Stack>
            <Typography variant="Heading07">{t('profitability')}</Typography>
            <Box sx={{ '& svg': { padding: '10px' } }}>
              <MonthlyProfitabilityChart strategy={strategy} />
            </Box>
          </Stack>
          <Stack>
            <Typography variant="Heading07">{t('drawdown')}</Typography>
            <Box sx={{ '& svg': { padding: '10px' } }}>
              <MonthlyDrawdownChart strategy={strategy} />
            </Box>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};
