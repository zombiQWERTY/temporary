import { Box, Grid, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { GetStrategyByIdApi } from '@/entities/TrustManagements';
import { InvestButton } from './InvestButton';

interface InstrumentsProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

export const Instruments = ({ strategy }: InstrumentsProps) => {
  const t = useTranslations('TrustManagement.Strategy.Instruments');

  return (
    <Grid container columnSpacing={{ xs: 5, xxl: 37 }}>
      <Grid item xs={12} lg={6}>
        <Typography variant="Heading07" mb={7} component="h1">
          {t('list_of_instruments')}
        </Typography>
        <Grid container columnSpacing={12} mb={10}>
          {strategy.profiles?.[0]?.portfolioInstruments?.map((i) => (
            <Grid item key={i.color}>
              <Stack direction="row" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: i.color,
                    borderRadius: '100%',
                  }}
                />
                <Typography variant="BodyMRegular">{i.name}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
        <InvestButton
          strategyId={strategy.id}
          strategyCurrency={strategy.baseCurrency}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};
