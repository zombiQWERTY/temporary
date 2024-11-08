import { Grid, Stack, Typography, Paper, Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { AdvGoldForRegistrationCard } from '@/widgets/Cards/AdvGoldForRegistrationCard';
import { ManagerCard } from '@/widgets/Cards/ManagerCard';
import { PaymentMethodsCard } from '@/widgets/Cards/PaymentMethodsCard';
import { PlayVideoCard } from '@/widgets/Cards/PlayVideoCard';
import { PromotionsCard } from '@/widgets/Cards/PromotionsCard';
import { SelectProductCard } from '@/widgets/Cards/SelectProductCard';
import { TopAccountCard } from '@/widgets/Cards/TopAccountCard';
import { ShowVerificationCardWrapper } from './ShowVerificationCardWrapper';

export const Dashboard = () => {
  const t = useTranslations('Dashboard');

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          xl={8}
          sx={{
            pt: 13,
            pb: 8,
            px: 6,
          }}
        >
          <Typography variant="Heading05">{t('Common.page_title')}</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid
          item
          xs={12}
          xxl={8}
          sx={{
            px: 6,
            pb: 10,
          }}
        >
          <Stack gap={5}>
            <Paper
              sx={{
                py: 8,
                px: 6.25,
              }}
            >
              <Stack gap="2" paddingBlockEnd={8}>
                <Typography variant="Heading07">
                  {t('start_investing')}
                </Typography>
                <Typography variant="BodyMRegular" color="text.secondary">
                  {t('start_investing_title')}
                </Typography>
              </Stack>
              <Grid container spacing={5}>
                <ShowVerificationCardWrapper />
                <Grid item xs={12} lg={6}>
                  <PlayVideoCard />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <TopAccountCard />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <SelectProductCard />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <PromotionsCard />
                </Grid>
                {/*<Grid item xs={12} lg={6}>*/}
                {/*  <TelegramCard />*/}
                {/*</Grid>*/}
              </Grid>
            </Paper>
            <Grid container spacing={5}>
              <Grid item xs={12} lg={6} display={{ xs: 'block', xxl: 'none' }}>
                <AdvGoldForRegistrationCard />
              </Grid>
              <Grid item xs={12} lg={6}>
                <ManagerCard
                  name="Ivanov Ivan"
                  phone="+7 (999) 900-99-99 доб. 24"
                  email="ivanov.ivan@gmail.com"
                />
              </Grid>
              <Grid item xs={12} lg={6} height="100%">
                <PaymentMethodsCard />
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        <Grid
          item
          xs={0}
          xxl={4}
          sx={{
            pr: 6,
            pb: 10,
          }}
        >
          <Box display={{ xs: 'none', xxl: 'block' }}>
            <AdvGoldForRegistrationCard />
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
