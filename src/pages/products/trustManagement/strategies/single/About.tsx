import { Box, Grid, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { GetStrategyByIdApi } from '@/entities/TrustManagements';
import { YearlyProfitabilityChart } from './charts/YearlyProfitabilityChart';
import { InvestButton } from './InvestButton';

interface AboutProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

export const About = ({ strategy }: AboutProps) => {
  const t = useTranslations('TrustManagement.Strategy.About');

  return (
    <Grid container columnSpacing={{ xs: 5, xxl: 37 }}>
      <Grid item xs={12} lg={6}>
        <Typography variant="Heading06" mb={10} component="h1">
          {t('advantages_of_strategy')}
        </Typography>
        {strategy.profiles?.[0]?.strategyAdvantages?.map((adv) => (
          <Box key={adv.title} mb={10}>
            <Typography variant="BodyMSemiBold" component="h2" mb={3}>
              {adv.title}
            </Typography>
            <Typography variant="BodyMRegular" component="p">
              {adv.text}
            </Typography>
          </Box>
        ))}
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
              <YearlyProfitabilityChart strategy={strategy} />
            </Box>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};
