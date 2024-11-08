import { Grid, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

import { StrategiesTable } from '@/features/trustManagement';
import { GetStrategiesApi } from '@/entities/TrustManagements';
import { PageTitle } from '@/shared/ui';
import { MyInvestmentsButton } from '../../ui/MyInvestmentsButton';
import { RatingOfStrategiesButton } from '../../ui/RatingOfStrategiesButton';

interface ListProps {
  initialStrategiesData: GetStrategiesApi.GetStrategiesDtoSchema | null;
}

export const List = (props: ListProps) => {
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
        <RatingOfStrategiesButton active />
        <MyInvestmentsButton />
      </Stack>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            px: 6,
          }}
        >
          <StrategiesTable
            initialStrategiesData={props.initialStrategiesData}
          />
        </Grid>
      </Grid>
    </>
  );
};
