import { Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

import { WithdrawalForm } from '@/features/transactions';
import { AccountRoutes } from '@/shared/router';
import { Breadcrumbs, PageTitle } from '@/shared/ui';

export const Withdrawal = () => {
  const t = useTranslations('Withdrawal');

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
            { title: t('Breadcrumbs.withdraw_by_details'), isActive: true },
          ]}
        />
        <PageTitle title={t('Common.page_title')} href={AccountRoutes.Base} />
        <WithdrawalForm />
      </Grid>
    </Grid>
  );
};
