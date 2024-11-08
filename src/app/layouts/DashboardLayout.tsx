'use client';
import { Grid, Stack, Box } from '@mui/material';
import React, { PropsWithChildren } from 'react';

import { CompleteVerificationCard } from '@/widgets/Cards/CompleteVerificationCard';
import { DashboardSideMenu } from '@/widgets/DashboardSideMenu';
import { TotalBalances } from '@/widgets/TotalBalances';
import { UserMenu } from '@/widgets/UserMenu';
import { GetMyBalanceApi } from '@/entities/Accounts';
import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { Logo } from '@/shared/ui';
import { DashboardFooter } from './DashboardFooter';

interface LayoutProps {
  initialBalancesData: GetMyBalanceApi.GetMyBalanceDtoSchema | undefined;
}

export const DashboardLayout = ({
  children,
  initialBalancesData,
}: PropsWithChildren<LayoutProps>) => {
  const user = useUser();

  return (
    <>
      <Grid
        container
        sx={{ backgroundColor: 'common.white' }}
        alignItems="stretch"
      >
        <Grid
          item
          width={{ xs: '84px', xl: '336px' }}
          sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Box
            sx={{
              alignSelf: 'baseline',
              width: '100%',
              py: 4,
              px: { sm: 0, xl: 5 },
            }}
          >
            <Logo narrow />
          </Box>
        </Grid>
        <Grid
          item
          xs
          display="flex"
          sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            px={6}
            width="100%"
            alignItems="center"
          >
            {user.data?.accountStatus && (
              <TotalBalances
                accountStatus={user.data.accountStatus}
                initialData={initialBalancesData}
              />
            )}
            <UserMenu />
          </Stack>
        </Grid>
      </Grid>
      <Grid
        container
        sx={{ backgroundColor: 'common.white' }}
        alignItems="stretch"
      >
        <Grid
          item
          width={{ xs: '84px', xl: '336px' }}
          sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Stack
            justifyContent="space-between"
            sx={{
              minHeight: '100%',
              height: '100dvh',
            }}
          >
            <DashboardSideMenu />
            <Box
              sx={{
                margin: 4,
                position: 'fixed',
                left: '0',
                bottom: '65px',
                width: '300px',
              }}
              display={{ xs: 'none', xl: 'flex' }}
            >
              {user.data?.accountStatus &&
                [
                  AccountStatusEnum.Registered,
                  AccountStatusEnum.VerificationInProgress,
                ].includes(user.data.accountStatus) && (
                  <CompleteVerificationCard
                    currentStage={user.data.verificationStage}
                  />
                )}
            </Box>
            <DashboardFooter />
          </Stack>
        </Grid>

        <Grid item xs width={{ xs: 'calc(100% - 84px)', xl: '336px' }}>
          <main>{children}</main>
        </Grid>
      </Grid>
    </>
  );
};
