import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { PropsWithChildren } from 'react';

interface VerificationSectionProps {
  title: string;
  subtitle?: string;
  note?: string;
}

export const VerificationSection: React.FC<
  PropsWithChildren<VerificationSectionProps>
> = ({ title, subtitle, note, children }) => {
  return (
    <Box display="flex" flexDirection="column">
      <Typography variant="Heading07" sx={{ mb: subtitle ? 2 : 8 }}>
        {title}
      </Typography>
      {note && (
        <Typography sx={{ mb: 4 }} variant="BodySSemiBold" color="info.main">
          {note}
        </Typography>
      )}
      {subtitle && (
        <Typography sx={{ mb: 8 }} variant="BodySRegular" color="grey.300">
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
  );
};
