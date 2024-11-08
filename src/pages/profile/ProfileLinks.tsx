'use client';
import { Button, Grid, Link, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { UserCard } from '@/widgets/Cards/UserCard';
import { ProfileRoutes } from '@/shared/router';

interface LinksProps {
  active: string;
}

export const ProfileLinks = ({ active }: LinksProps) => {
  const t = useTranslations('Profile.Common');

  const routeItems = useMemo(
    () => [
      { label: t('personal_data'), route: ProfileRoutes.Base },
      { label: t('passport_details'), route: ProfileRoutes.Identity },
      { label: t('address_details'), route: ProfileRoutes.Location },
      { label: t('economic_profile'), route: ProfileRoutes.Economic },
      { label: t('taxpayer_profile'), route: ProfileRoutes.Tax },
      { label: t('documents'), route: ProfileRoutes.Documents },
    ],
    [t],
  );

  return (
    <Stack gap={10}>
      <Grid container spacing={3}>
        {routeItems.map(({ label, route }) => (
          <Grid item key={route}>
            <Link href={route}>
              <Button
                variant="ghost"
                sx={{
                  background:
                    active === route
                      ? (theme) => theme.palette.secondary.main
                      : undefined,
                  color:
                    active !== route
                      ? (theme) => theme.palette.text.secondary
                      : undefined,
                }}
                size="medium"
              >
                {label}
              </Button>
            </Link>
          </Grid>
        ))}
      </Grid>
      <UserCard />
    </Stack>
  );
};
