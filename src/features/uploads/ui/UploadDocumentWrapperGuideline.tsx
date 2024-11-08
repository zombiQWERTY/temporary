import { Box, Grid, Stack } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { Requirements } from './Requirements';

export const UploadDocumentWrapperGuideline: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <Grid container spacing={8}>
      <Grid item xs={12} xl={7}>
        <Stack direction="column" flexWrap="nowrap" gap={5}>
          {children}
        </Stack>
      </Grid>
      <Grid item xs={0} xl={5}>
        <Box display={{ xs: 'none', xl: 'block' }}>
          <Requirements />
        </Box>
      </Grid>
    </Grid>
  );
};
