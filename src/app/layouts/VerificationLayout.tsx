import { Container, Grid, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import { VerificationStepper } from '@/widgets/VerificationStepper';
import { Routes } from '@/shared/router';
import { Logo, PageTitle } from '@/shared/ui';
import { VerificationFooter } from './VerificationFooter';

interface LayoutProps {
  children: ReactNode;
}

export const VerificationLayout = ({ children }: LayoutProps) => {
  const t = useTranslations('Verification.Common');

  return (
    <>
      <Container maxWidth="lgp">
        <Grid container spacing={8} mb={10} py={6}>
          <Grid item xs={12} xl={3.5}>
            <Logo fullWidthOnMobile />
          </Grid>
        </Grid>

        <Grid
          container
          spacing={8}
          direction={{ xs: 'column', xl: 'row' }}
          display={{ xs: 'none', xl: 'flex' }}
          mb={8}
        >
          <Grid item xs={12} xl={8.5} ml="auto">
            <PageTitle
              title={t('page_title')}
              href={Routes.Dashboard}
              variant="Heading06"
              compact
            />
          </Grid>
        </Grid>

        <Grid container spacing={8} direction={{ xs: 'column', xl: 'row' }}>
          <Grid item xs={12} xl={3.5}>
            <VerificationStepper />
          </Grid>

          <Grid item xs={12} xl={8.5} width="100%">
            <Paper sx={{ p: 8, gap: 12, width: '100%' }}>{children}</Paper>
          </Grid>
        </Grid>
      </Container>

      <VerificationFooter />
    </>
  );
};
