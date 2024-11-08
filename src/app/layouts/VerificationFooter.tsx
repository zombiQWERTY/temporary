import { Box, Typography, Link, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

const linkKeys = {
  mindMoney: 'https://mind-money.eu',
  contactSupport: 'https://trade.mind-money.eu/cabinet',
  servicePlans: 'https://mind-money.eu/en/tariffs',
  termsOfBusiness:
    'https://mind-money.eu/static/b1a02f2848d9d1132ce1d8ea7fc876ce/33f81b5f-ea74-44a9-b440-fe93f636f647_Terms+of+business.pdf',
  privacyPolicy:
    'https://mind-money.eu/static/1f812d3177f1fe08862b42535b4881b0/c57e700d-4278-4246-9e48-5fa352f5d894_PRIVACY+POLICY.pdf',
  dataProtectionNotice: 'https://mind-money.eu/en/documents',
  documents: 'https://mind-money.eu/en/documents',
} as const;

export const VerificationFooter = () => {
  const t = useTranslations('Layouts.Verification.Footer');

  return (
    <Box
      display={{ xs: 'none', xl: 'block' }}
      component="footer"
      p={6}
      mt={8}
      sx={{
        backgroundColor: '#fff',
      }}
    >
      <Grid
        container
        justifyContent="space-between"
        alignItems="flex-start"
        direction="column"
        gap={4}
      >
        <Grid item xs={12} md={6}>
          <Grid container spacing={5}>
            {Object.entries(linkKeys).map(([key, href]) => (
              <Grid item key={key}>
                <Link href={href} color="inherit" underline="none">
                  <Typography variant="FootnoteRegular" color="textSecondary">
                    {t(key as keyof typeof linkKeys)}
                  </Typography>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="FootnoteRegular" color="textSecondary">
            {t.rich('description', {
              link: (href) => (
                <Link
                  href={String(href)}
                  color="textSecondary"
                  underline="hover"
                >
                  {href}
                </Link>
              ),
            })}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
