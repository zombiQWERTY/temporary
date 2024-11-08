import { Box, Grid, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { GetStrategyByIdApi } from '@/entities/TrustManagements';
import { InvestButton } from './InvestButton';

interface RisksProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

export const Risks = ({ strategy }: RisksProps) => {
  const t = useTranslations('TrustManagement.Strategy.Risks');

  return (
    <Grid container columnSpacing={{ xs: 5, xxl: 37 }}>
      <Grid item xs={12} lg={6}>
        <Typography variant="Heading06" mb={10} component="h1">
          {t('risk_management')}
        </Typography>
        {strategy.profiles?.[0]?.riskManagement?.map((adv) => (
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
    </Grid>
  );
};
