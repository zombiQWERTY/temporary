'use client';
import { Grid } from '@mui/material';
import { useMemo } from 'react';

import { GoVerificationCard } from '@/widgets/Cards/GoVerificationCard';
import { useUser } from '@/shared/auth';
import {
  AccountStatusEnum,
  VerificationStageEnum,
} from '@/shared/commonProjectParts';

export const ShowVerificationCardWrapper = () => {
  const user = useUser();
  const handleUserStatus = useMemo(
    () =>
      user.data?.accountStatus &&
      [
        AccountStatusEnum.Registered,
        AccountStatusEnum.VerificationInProgress,
      ].includes(user.data.accountStatus) &&
      user.data.verificationStage !== VerificationStageEnum.Contract,
    [user.data?.accountStatus, user.data?.verificationStage],
  );

  return handleUserStatus ? (
    <Grid item xs={12} lg={6}>
      <GoVerificationCard />
    </Grid>
  ) : null;
};
