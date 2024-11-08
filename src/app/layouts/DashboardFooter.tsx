import { Stack, Typography } from '@mui/material';
import { useFormatter, useTranslations } from 'next-intl';
import React from 'react';

export const DashboardFooter: React.FC = () => {
  const t = useTranslations('Layouts.Dashboard.Footer');

  const { dateTime } = useFormatter();
  const currentYear = dateTime(new Date(), { year: 'numeric' });

  return (
    <Stack
      display={{ xs: 'none', xl: 'flex' }}
      sx={{ position: 'fixed', bottom: 0, left: 0 }}
      component="footer"
      p={6}
      mt={8}
    >
      <Typography variant="FootnoteRegular" color="textSecondary">
        {t('companyWithYear', { year: currentYear })}
      </Typography>
      <Typography variant="FootnoteRegular" color="textSecondary">
        {t('allRightsReserved')}
      </Typography>
    </Stack>
  );
};
