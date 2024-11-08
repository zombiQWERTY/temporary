'use client';
import { Typography, Stack, Chip } from '@mui/material';

import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { Avatar, CheckIcon } from '@/shared/ui';

export const UserCard = () => {
  const { data: user } = useUser();

  const lastName = user?.lastName;
  const firstNameInitial = user?.firstName;

  const displayName =
    lastName || firstNameInitial
      ? `${lastName || 'N/A'} ${firstNameInitial}`
      : 'N/A';

  return (
    <Stack direction="row" gap={6} alignItems="center">
      <Avatar size="xxxxl" />

      <Stack>
        <Typography variant="Heading07">{displayName}</Typography>
        <Stack direction="row" gap={4} alignItems="center">
          <Typography variant="BodySRegular" color="text.secondary">
            Smart in USD
          </Typography>
          {user?.accountStatus === AccountStatusEnum.Verified && (
            <Chip
              color="success"
              label="Verified"
              icon={<CheckIcon fontSize="medium" />}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
