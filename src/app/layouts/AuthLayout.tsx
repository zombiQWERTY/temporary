import { Box, Grid, Link, Stack, Typography } from '@mui/material';
import { useFormatter, useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import { Logo } from '@/shared/ui';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const t = useTranslations('Layouts.Auth');
  const { dateTime } = useFormatter();
  const currentYear = dateTime(new Date(), { year: 'numeric' });

  return (
    <>
      {/* Background banner */}
      <Box
        component="div"
        display={{ xs: 'none', sm: 'none', xl: 'flex' }}
        sx={{
          backgroundImage: 'url(/images/banner.png)',
          backgroundPosition: 'left top',
          backgroundSize: 'cover',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '50%',
          zIndex: -1,
        }}
      />

      {/* Main content area */}
      <Stack direction="column" alignItems="center" height="100vh">
        {/* Logo */}
        <Box
          sx={{
            alignSelf: 'baseline',
            width: '100%',
            py: 6,
            mb: 16,
            pl: { sm: 3, xl: '7%' },
          }}
        >
          <Logo fullWidthOnMobile />
        </Box>

        {/* Content grid */}
        <Grid container sx={{ height: '100%' }}>
          {/* Left content: children and footer */}
          <Grid
            item
            xs={12}
            xl={6}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
          >
            {children}

            {/* Footer */}
            <Stack
              direction="row"
              sx={{
                py: 16,
                fontSize: 14,
                color: 'grey.500',
              }}
              justifyContent="space-around"
              width="100%"
            >
              <Typography component="span" variant="BodySRegular">
                {t('Footer.companyWithYear', { year: currentYear })}
              </Typography>
              <Typography component="span" variant="BodySRegular">
                {t.rich('Footer.contact', {
                  link: (email) => (
                    <Link
                      href={`mailto:${email}`}
                      variant="body2"
                      underline="hover"
                    >
                      {email}
                    </Link>
                  ),
                })}
              </Typography>
            </Stack>
          </Grid>

          {/* Right content: marketing info */}
          <Grid
            item
            xs={12}
            xl={6}
            px={16}
            display={{ xs: 'none', sm: 'none', xl: 'flex' }}
          >
            <Stack
              gap={6}
              color="common.white"
              sx={{
                position: 'fixed',
                top: '150px',
              }}
            >
              <Typography variant="Heading01">
                {t('RightPanel.title')}
              </Typography>
              <Typography variant="BodyMRegular">
                {t('RightPanel.description')}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};
