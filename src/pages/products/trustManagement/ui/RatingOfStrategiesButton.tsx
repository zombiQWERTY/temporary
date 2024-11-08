'use client';

import { Button, Link } from '@mui/material';
import { useTranslations } from 'next-intl';

import { TrustManagementRoutes } from '@/shared/router';

interface RatingOfStrategiesButtonProps {
  active?: boolean;
}

export const RatingOfStrategiesButton = ({
  active = false,
}: RatingOfStrategiesButtonProps) => {
  const t = useTranslations('TrustManagement');

  return (
    <Link href={TrustManagementRoutes.Base}>
      <Button
        variant="ghost"
        sx={{
          background: active
            ? (theme) => theme.palette.secondary.main
            : undefined,
        }}
        size="medium"
      >
        {t('rating_of_strategies')}
      </Button>
    </Link>
  );
};
