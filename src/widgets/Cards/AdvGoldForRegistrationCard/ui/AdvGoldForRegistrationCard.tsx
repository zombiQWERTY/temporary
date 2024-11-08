import { Paper, Stack, Typography, Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import backgroundImage from './background.png';
import { OpenAccountButton } from './OpenAccountButton';

export const AdvGoldForRegistrationCard = () => {
  const t = useTranslations('Widgets.AdvGoldForRegistrationCard');

  return (
    <Paper
      sx={{
        py: 8,
        px: 6,
        height: '100%',
        borderRadius: '1.5',
        background: 'linear-gradient(102deg, #9F47E4 0%, #526ED3 100%)',
        color: '#fff',
        position: 'relative',
        border: 0,
      }}
    >
      <Stack gap={10} width={{ xs: '100%', md: '60%' }}>
        <Stack gap={4}>
          <Typography variant="Heading04">
            {t('get_gold_for_registration')}
          </Typography>
          <Typography variant="BodyMRegular">
            {t('unlock_potential')}
          </Typography>
        </Stack>
        <Box
          position={{ xs: 'static', md: 'absolute' }}
          sx={{
            alignSelf: 'center',
            background: `url(${backgroundImage.src}) no-repeat center`,
            backgroundSize: 'cover',
            width: '220px',
            height: '190px',
            right: '-15px',
            bottom: '30px',
          }}
        />
        <OpenAccountButton />
      </Stack>
    </Paper>
  );
};
