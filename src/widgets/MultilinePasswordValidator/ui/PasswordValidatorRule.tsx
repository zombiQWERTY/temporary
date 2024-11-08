import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { SvgError } from '@/widgets/MultilinePasswordValidator/ui/SvgError';
import { SvgSuccess } from '@/widgets/MultilinePasswordValidator/ui/SvgSuccess';

const lineSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const PasswordValidatorRule: React.FC<{
  message: string;
  isValid: boolean;
}> = ({ message, isValid }) => {
  const color = isValid ? 'success.main' : 'error.main';
  return (
    <Box sx={lineSx}>
      {isValid ? <SvgSuccess /> : <SvgError stroke={color} />}
      <Typography variant="CaptionRegular" color={color}>
        {message}
      </Typography>
    </Box>
  );
};
