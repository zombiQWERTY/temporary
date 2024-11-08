import { Typography, Stack, Paper, Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { VisaCardIcon, MasterCardIcon, BankIcon } from '@/shared/ui';
import { PaymentMethodItem } from './PaymentMethodItem';

export const PaymentMethodsCard = () => {
  const t = useTranslations('Widgets.PaymentMethodsCard');

  const methods = [
    {
      id: 1,
      text: t('bank_card'),
      icon: <MasterCardIcon fontSize="large" />,
    },
    {
      id: 2,
      text: t('bank_card'),
      icon: <VisaCardIcon fontSize="large" />,
    },
    {
      id: 3,
      text: t('bank_transfer', { currency: '$' }),
      icon: <BankIcon fontSize="large" />,
    },
    {
      id: 4,
      text: t('bank_transfer', { currency: '€' }),
      icon: <BankIcon fontSize="large" />,
    },
  ];

  return (
    <Paper
      sx={{
        py: 6,
        cursor: 'auto',
        display: 'flex',
        textDecoration: 'none',
        minHeight: 'auto',
        height: '100%',
        borderRadius: '1.5',
      }}
    >
      <Stack gap={4} justifySelf="stretch" width="100%">
        <Box px={6}>
          <Typography variant="Heading07">{t('payment_methods')}</Typography>
        </Box>
        <Stack width="100%">
          {methods.map((item) => (
            <PaymentMethodItem
              key={item.id}
              icon={item.icon}
              text={item.text}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
