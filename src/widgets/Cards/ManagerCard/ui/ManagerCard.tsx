import { Button, Typography, Stack, Paper } from '@mui/material';

import { useTranslations } from 'next-intl';
import { Avatar, CallMedicineRoundedIcon } from '@/shared/ui';

export interface ManagerCardProps {
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
}

export const ManagerCard = ({
  name,
  phone,
  email,
  avatarUrl,
}: ManagerCardProps) => {
  const t = useTranslations('Widgets.ManagerCard');

  return (
    <Paper
      sx={{
        padding: 6,
        cursor: 'auto',
        display: 'flex',
        textDecoration: 'none',
        minHeight: 'auto',
        height: '100%',
        borderRadius: '1.5',
      }}
    >
      <Stack gap={6} direction="column" width="100%">
        <Typography variant="Heading07">{t('your_manager')}</Typography>

        <Stack direction="row" gap={4} alignItems="center">
          <Avatar size="xxxl" src={avatarUrl} />
          <Typography variant="BodyMSemiBold">{name}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Stack gap={2}>
            <Typography variant="BodySRegular" color="text.secondary">
              {t('phone')}:
            </Typography>
            <Typography variant="BodySRegular" color="primary">
              {phone}
            </Typography>
          </Stack>

          <Stack gap={2}>
            <Typography variant="BodySRegular" color="text.secondary">
              {t('email')}:
            </Typography>
            <Typography variant="BodySRegular" color="primary">
              {email}
            </Typography>
          </Stack>
        </Stack>

        <Button
          fullWidth
          startIcon={<CallMedicineRoundedIcon />}
          variant="secondary"
        >
          {t('request_call')}
        </Button>
      </Stack>
    </Paper>
  );
};
