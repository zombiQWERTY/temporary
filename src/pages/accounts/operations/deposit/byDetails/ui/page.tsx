import { Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

import { AccountRoutes } from '@/shared/router';
import { PageTitle, Breadcrumbs } from '@/shared/ui';
import { BankInfo } from './BankInfo';

export const DepositByDetails = ({ id }: { id: string }) => {
  const t = useTranslations('DepositByDetails');

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          pt: 11,
          pb: 8,
          px: 6,
        }}
      >
        <Breadcrumbs
          data={[
            { title: t('Breadcrumbs.accounts'), link: AccountRoutes.Base },
            { title: t('Breadcrumbs.deposit'), link: AccountRoutes.Base },
            { title: t('Breadcrumbs.deposit_by_details'), isActive: true },
          ]}
        />
        <PageTitle title={t('Common.page_title')} href={AccountRoutes.Base} />
        <BankInfo id={id} />
      </Grid>
    </Grid>
  );
};
