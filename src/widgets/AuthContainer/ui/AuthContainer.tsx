import { Stack, Paper, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ReactNode, startTransition, useMemo } from 'react';
import { useProgress } from 'react-transition-progress';

import { Routes } from '@/shared/router';
import { Tabs, Tab, PageTitle } from '@/shared/ui';

const routeTabsOptions = [Routes.SignUp, Routes.SignIn];

export interface AuthContainerProps {
  backUrl?: string;
  title?: string;
  subTitle?: string;
  children: ReactNode;
}

export const AuthContainer = ({
  children,
  backUrl,
  title,
  subTitle,
}: AuthContainerProps) => {
  const pathname = usePathname();
  const t = useTranslations('Auth.Common');
  const startProgress = useProgress();

  const renderBackButtonOrTabs = useMemo(() => {
    const onTabClick = () => {
      // @FIXME: Tab uses Link component that already do this process below but it dows not work somehow
      startTransition(() => {
        startProgress();
      });
    };

    if (backUrl) {
      return (
        <PageTitle title={title} href={backUrl} variant="Heading06" compact />
      );
    }

    return (
      <Tabs
        value={pathname?.includes(routeTabsOptions[0]) ? 0 : 1}
        variant="fullWidth"
      >
        <Tab
          id="signup"
          label={t('sign_up_title')}
          sx={{ width: '50%' }}
          href={Routes.SignUp}
          onClick={onTabClick}
        />
        <Tab
          id="signin"
          label={t('sign_in_title')}
          sx={{ width: '50%' }}
          href={Routes.SignIn}
          onClick={onTabClick}
        />
      </Tabs>
    );
  }, [backUrl, pathname, t, startProgress, title]);

  return (
    <Paper
      sx={{
        width: '516px',
        paddingX: 12,
        paddingY: 12,
        gap: 12,
      }}
    >
      <Stack direction="column" gap={12}>
        <Stack direction="column" gap={4}>
          {renderBackButtonOrTabs}
          {subTitle && (
            <Typography variant="BodyMRegular" color="grey.500">
              {subTitle}
            </Typography>
          )}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
};
