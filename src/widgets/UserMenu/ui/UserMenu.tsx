'use client';
import {
  Typography,
  Stack,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Link,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState, useMemo, MouseEvent, startTransition } from 'react';
import { useProgress } from 'react-transition-progress';

import { useUser, signOutAction } from '@/shared/auth';
import { ProfileRoutes } from '@/shared/router';
import {
  Avatar,
  CaretDownIcon,
  CaretUpIcon,
  LogoutIcon,
  HamburgerIcon,
  UserCircleIcon,
} from '@/shared/ui';

const NotAvailable = 'N/A' as const;

export const UserMenu = () => {
  const t = useTranslations('Widgets.UserMenu');
  const { data: user } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const startProgress = useProgress();

  const handleMenuToggle = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    setAnchorEl(null);
    startTransition(() => {
      startProgress();
    });

    await signOutAction();
  };

  const displayName = useMemo(() => {
    const lastName = user?.lastName || NotAvailable;
    const firstNameInitial = user?.firstName?.charAt(0) || '';
    return `${lastName} ${firstNameInitial ? firstNameInitial + '.' : ''}`;
  }, [user?.firstName, user?.lastName]);

  return (
    <>
      <Stack
        direction="row"
        gap={3}
        alignItems="center"
        sx={{
          cursor: 'pointer',
          display: { xs: 'none', lg: 'flex' },
        }}
        onClick={handleMenuToggle}
      >
        <Avatar />

        <Stack>
          <Typography variant="BodyMMedium">{displayName}</Typography>
          <Typography variant="FootnoteRegular" color="text.secondary">
            Smart in USD
          </Typography>
        </Stack>

        {anchorEl ? (
          <CaretUpIcon fontSize="large" />
        ) : (
          <CaretDownIcon fontSize="large" />
        )}
      </Stack>

      <Box alignItems="center" sx={{ display: { xs: 'flex', lg: 'none' } }}>
        <IconButton onClick={handleMenuToggle}>
          <HamburgerIcon fontSize="large" />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <Link href={ProfileRoutes.Base} sx={{ textDecoration: 'none' }}>
          <MenuItem sx={{ width: '200px' }}>
            <Stack direction="row" gap={3} alignItems="center">
              <UserCircleIcon fontSize="large" />
              <Typography>{t('profile')}</Typography>
            </Stack>
          </MenuItem>
        </Link>

        <MenuItem onClick={handleSignOut} sx={{ width: '200px' }}>
          <Stack direction="row" gap={3} alignItems="center" color="error.main">
            <LogoutIcon fontSize="large" />
            <Typography>{t('logout')}</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </>
  );
};
