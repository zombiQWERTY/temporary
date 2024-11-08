import { Grid, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AccountActionItemsGrid } from './AccountActionItemsGrid';

export const PaymentsAndTransfersCard = () => {
  const t = useTranslations('Widgets.AccountActions.PaymentsAndTransfersCard');

  return (
    <Paper
      sx={{
        paddingBlock: 8,
        paddingInline: 6,
      }}
    >
      <Typography variant="Heading07">{t('title')}</Typography>

      <Grid mt={3} container spacing={5}>
        <AccountActionItemsGrid spacing={5} />
      </Grid>
    </Paper>
  );
};
