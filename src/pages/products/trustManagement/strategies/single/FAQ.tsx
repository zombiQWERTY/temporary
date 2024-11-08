import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from '@mui/material';

import { GetStrategyByIdApi } from '@/entities/TrustManagements';
import { InvestButton } from './InvestButton';

interface FAQProps {
  strategy: GetStrategyByIdApi.StrategySchema;
}

export const FAQ = ({ strategy }: FAQProps) => {
  return (
    <Grid container columnSpacing={{ xs: 5, xxl: 37 }}>
      <Grid item xs={12} lg={6} pt={6}>
        {strategy.profiles?.[0]?.faq?.map((adv, idx) => (
          <Box key={adv.title} mb={4}>
            <Accordion defaultExpanded={idx === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="BodyMMedium">{adv.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="BodySRegular">{adv.text}</Typography>
              </AccordionDetails>
            </Accordion>
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
