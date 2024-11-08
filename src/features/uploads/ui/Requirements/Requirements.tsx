import { Box, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';

import black_white from './images/black-white.svg';
import blurred from './images/blurred.svg';
import covered from './images/covered.svg';
import cropped from './images/cropped.svg';
import dark from './images/dark.svg';
import optimal from './images/optimal.svg';
import overexposed from './images/overexposed.svg';
import small from './images/small.svg';

const guidelinesData = [
  { key: 'optimal', image: optimal.src },
  { key: 'cropped', image: cropped.src },
  { key: 'small', image: small.src },
  { key: 'black_and_white', image: black_white.src },
  { key: 'overexposed', image: overexposed.src },
  { key: 'dark', image: dark.src },
  { key: 'blurred', image: blurred.src },
  { key: 'covered', image: covered.src },
] as const;

const GuidelineBox: React.FC<{ title: string; image: string }> = ({
  title,
  image,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    width="84px"
  >
    <Image src={image} alt={title} width={84} height={72} />
    <Typography mt={2} variant="FootnoteRegular" color="textSecondary">
      {title}
    </Typography>
  </Box>
);

export const Requirements: React.FC = () => {
  const t = useTranslations('Features.UploadDocument.Requirements');

  return (
    <Box>
      <Typography
        variant="BodySRegular"
        mb={6}
        component="div"
        color="textSecondary"
      >
        {t('document_visibility')}
      </Typography>
      <Grid container spacing={6}>
        {guidelinesData.map((guideline) => (
          <Grid item xs={4} key={guideline.key}>
            <GuidelineBox title={t(guideline.key)} image={guideline.image} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
