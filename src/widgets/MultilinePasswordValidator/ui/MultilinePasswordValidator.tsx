'use client';

import { Stack, Typography, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { PasswordValidatorRule } from '@/widgets/MultilinePasswordValidator';
import {
  CONTAIN_NUMBER_OR_SYMBOL_REGEXP,
  MIN_PASSWORD_LENGTH,
} from '@/shared/auth';

interface PasswordValidatorProps {
  name: string;
}

const isValidEmail = (password: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(password);
};

const validatePassword = (password: string) => ({
  isNotContainEmail: isValidEmail(password),
  isContainUppercase: /[A-Z]/.test(password),
  isContainSpecialCharOrNumber: CONTAIN_NUMBER_OR_SYMBOL_REGEXP.test(password),
  isMinLength: password.length >= MIN_PASSWORD_LENGTH,
});

export const MultilinePasswordValidator: React.FC<PasswordValidatorProps> = ({
  name,
}) => {
  const t = useTranslations('Widgets.MultilinePasswordValidator');
  const {
    watch,
    formState: { errors },
  } = useFormContext();

  const password = watch(name);
  const isError = !!errors[name];
  const validateData = useMemo(() => validatePassword(password), [password]);

  return (
    <Box>
      <Typography
        variant="FootnoteRegular"
        color="grey.300"
        mb="8px"
        sx={{ display: 'inline-flex', gap: '4px' }}
        component="div"
      >
        {t('password_strength')}:
        {password && isError && (
          <Typography
            variant="FootnoteRegular"
            color="error.main"
            component="span"
          >
            {t('weak_password')} :(
          </Typography>
        )}
      </Typography>

      <Stack gap="8px">
        <PasswordValidatorRule
          message={t('cant_contain_email')}
          isValid={!!password && validateData.isNotContainEmail}
        />
        <PasswordValidatorRule
          message={t('at_least_characters', { count: MIN_PASSWORD_LENGTH })}
          isValid={validateData.isMinLength}
        />
        <PasswordValidatorRule
          message={t('contains_number_or_symbol')}
          isValid={validateData.isContainSpecialCharOrNumber}
        />
        <PasswordValidatorRule
          message={t('capitalized_letter')}
          isValid={validateData.isContainUppercase}
        />
      </Stack>
    </Box>
  );
};
