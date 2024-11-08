import { Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export const EmptyTransactions = () => {
  const t = useTranslations('Widgets.RecentTransactions');

  return (
    <Stack gap={6} alignItems="center">
      <Image
        src="/images/empty-transactions.svg"
        width={240}
        height={240}
        alt="empty transaction"
      />

      <Typography variant="BodyMRegular" color="text.secondary">
        {t('empty_transaction')}
      </Typography>
    </Stack>
  );
};
