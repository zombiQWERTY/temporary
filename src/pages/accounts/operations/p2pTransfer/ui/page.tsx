import { Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

import { P2PTransferForm } from '@/features/transactions';
import { AccountRoutes } from '@/shared/router';
import { Breadcrumbs, PageTitle } from '@/shared/ui';

export const P2PTransfer = () => {
  const t = useTranslations('P2PTransfer');

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
            {
              title: t('Breadcrumbs.p2p_transfer'),
              isActive: true,
            },
          ]}
        />
        <PageTitle title={t('Common.page_title')} href={AccountRoutes.Base} />
        <P2PTransferForm />
      </Grid>
    </Grid>
  );
};
