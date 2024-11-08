import { Grid, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

import { InvestmentsTable } from '@/features/trustManagement';
import { GetInvestmentsApi } from '@/entities/TrustManagements';
import { PageTitle } from '@/shared/ui';
import { MyInvestmentsButton } from '../ui/MyInvestmentsButton';
import { RatingOfStrategiesButton } from '../ui/RatingOfStrategiesButton';

interface InvestmentsProps {
  initialInvestmentsData: GetInvestmentsApi.GetInvestmentsDtoSchema | null;
}

export const Investments = (props: InvestmentsProps) => {
  const t = useTranslations('TrustManagement');

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            pt: 13,
            pb: 8,
            px: 6,
          }}
        >
          <PageTitle title={t('Common.page_title')} compact />
        </Grid>
      </Grid>
      <Stack direction="row" gap={3} pl={6} mb={8}>
        <RatingOfStrategiesButton />
        <MyInvestmentsButton active />
      </Stack>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            px: 6,
          }}
        >
          <InvestmentsTable
            initialInvestmentsData={props.initialInvestmentsData}
          />
        </Grid>
      </Grid>
    </>
  );
};
