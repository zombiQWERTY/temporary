import { Box, Grid, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';
import { ProfileLinks } from '@/pages/profile/ProfileLinks';

interface ProfileWrapperProps {
  activeHref: string;
}

export const ProfileWrapper = ({
  children,
  activeHref,
}: PropsWithChildren<ProfileWrapperProps>) => {
  const t = useTranslations('Profile.Common');

  return (
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
        <Typography variant="Heading05">{t('profile')}</Typography>
        <Paper
          sx={{
            mt: 8,
            py: 10,
            px: 6,
            borderRadius: '1.5',
          }}
        >
          <Box mb={10}>
            <ProfileLinks active={activeHref} />
          </Box>
          {children}
        </Paper>
      </Grid>
    </Grid>
  );
};
