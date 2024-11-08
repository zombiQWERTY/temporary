import { Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { CircleWarningIcon } from '@/shared/ui';

export const Warnings = () => {
  const t = useTranslations('DepositByDetails.Confirmations');

  return (
    <>
      <Stack direction="row" gap={3}>
        <CircleWarningIcon fontSize="large" color="warning" />
        <Typography variant="BodySRegular" color="text.secondary">
          {t('payment_purpose_note')}
        </Typography>
      </Stack>
      <Stack direction="row" gap={3}>
        <CircleWarningIcon fontSize="large" color="warning" />
        <Typography variant="BodySRegular" color="text.secondary">
          {t('own_account_transfer_note')}
        </Typography>
      </Stack>
      <Stack direction="row" gap={3}>
        <CircleWarningIcon fontSize="large" color="warning" />
        <Typography variant="BodySRegular" color="text.secondary">
          {t('avoid_delays_tip')}
        </Typography>
      </Stack>
      <Stack direction="row" gap={3}>
        <CircleWarningIcon fontSize="large" color="info" />
        <Typography variant="BodySRegular" color="text.secondary">
          {t('bank_documents_notice')}
        </Typography>
      </Stack>
    </>
  );
};
