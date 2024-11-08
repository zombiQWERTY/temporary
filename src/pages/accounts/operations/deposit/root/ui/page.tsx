import { Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

import { AccountRoutes } from '@/shared/router';
import {
  Breadcrumbs,
  CardBase,
  CardSendIcon,
  PaperIcon,
  PageTitle,
} from '@/shared/ui';

const banks = [
  {
    href: `${AccountRoutes.DepositByDetails}/fib`,
    icon: <CardSendIcon fontSize="large" />,
    title: 'FIRST INVESTMENT BANK',
    titleDescription: 'USD/EUR',
  },
  {
    href: `${AccountRoutes.DepositByDetails}/ardshin`,
    icon: <PaperIcon fontSize="large" />,
    title: 'ARDSHINBANK',
    titleDescription: 'USD/EUR',
  },
];

export const Root = () => {
  const t = useTranslations('Deposit');
  return (
    <>
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
              { title: t('Breadcrumbs.deposit'), isActive: true },
            ]}
          />
          <PageTitle title={t('Common.page_title')} href={AccountRoutes.Base} />
          <Grid container spacing={5}>
            {banks.map((bank) => (
              <Grid item xs={12} md={4} key={bank.href}>
                <CardBase
                  href={bank.href}
                  icon={bank.icon}
                  title={bank.title}
                  titleDescription={bank.titleDescription}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
