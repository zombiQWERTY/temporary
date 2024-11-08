'use client';

import {
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Box,
  Typography,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/system';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { startTransition } from 'react';
import { useProgress } from 'react-transition-progress';
import { Routes } from '@/shared/router';

const steps = [
  { route: null, labelCode: 'email' },
  { route: Routes.PassportDetails, labelCode: 'passport_details' },
  { route: Routes.ResidenceAddress, labelCode: 'residence_address' },
  { route: Routes.EconomicProfile, labelCode: 'economic_profile' },
  { route: Routes.TaxpayerDetails, labelCode: 'taxpayer_details' },
  { route: Routes.SignContract, labelCode: 'sign_contract' },
] as const;

export const VerificationStepper = () => {
  const t = useTranslations('Verification.Stepper');
  const pathName = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isBelowXL = useMediaQuery(theme.breakpoints.down('xl'));
  const startProgress = useProgress();

  const activeStep = steps.findIndex((step) => step.route === pathName);

  const handleClickStep = (route: string | null) => () => {
    if (route) {
      startTransition(() => {
        startProgress();
      });

      router.push(route);
    }
  };

  return (
    <Paper sx={{ p: 8, gap: 10 }}>
      <Stack gap={10}>
        <Box sx={{ width: '100%' }}>
          <Typography
            align="center"
            variant="subtitle1"
            gutterBottom
            sx={{ display: { xs: 'block', xl: 'none' } }}
          >
            {t('step_of', {
              activeStep: activeStep + 1,
              totalSteps: steps.length,
            })}
          </Typography>
          <Stepper
            orientation={isBelowXL ? 'horizontal' : 'vertical'}
            activeStep={activeStep}
            sx={{
              flexDirection: { xs: 'row', xl: 'column' },
              justifyContent: { xs: 'center', xl: 'flex-start' },
              alignItems: { xs: 'center', xl: 'flex-start' },
            }}
          >
            {steps.map((step) => (
              <Step key={step.labelCode}>
                <StepButton onClick={handleClickStep(step.route)}>
                  <StepLabel>
                    <Box sx={{ display: { xs: 'none', xl: 'block' } }}>
                      {t(step.labelCode)}
                    </Box>
                  </StepLabel>
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
        <Button
          variant="linear"
          size="small"
          sx={{
            display: { xs: 'none', xl: 'flex' },
            color: theme.palette.grey[900],
            boxShadow: `inset 0 0 0 1px ${theme.palette.grey[900]}`,
            '&:hover': {
              color: theme.palette.grey[900],
              boxShadow: `inset 0 0 0 1px ${theme.palette.grey[300]}`,
            },
          }}
          href={Routes.Dashboard}
        >
          {t('pass_later')}
        </Button>
      </Stack>
    </Paper>
  );
};
