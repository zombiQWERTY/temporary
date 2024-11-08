import { Stack, Typography, LinearProgress, Paper, Link } from '@mui/material';

import { ChevronRightIcon } from '@/shared/ui';

export interface CardProgressBaseProps {
  title: string;
  subTitle?: string;
  progress: number;
  progressTitle: string;
  href: string;
  hasLink?: boolean;
}

export const CardProgressBase = ({
  title,
  subTitle,
  progress,
  progressTitle,
  href,
  hasLink,
}: CardProgressBaseProps) => {
  const content = (
    <Paper
      sx={{
        padding: 4,
        cursor: 'pointer',
        display: 'flex',
        textDecoration: 'none',
        width: '100%',
        height: '100%',
        borderRadius: '1.5',
        backgroundColor: 'grey.50',
        '&:hover': {
          backgroundColor: 'grey.100',
        },
        '&:active': {
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack gap={4} justifyContent="space-between">
        <Stack gap={4.5} color="primary.main">
          <Stack direction="row" gap={4} alignItems="center">
            <Typography variant="Heading07" color="text.primary">
              {title}
            </Typography>

            <ChevronRightIcon fontSize="large" color="primary" />
          </Stack>

          <LinearProgress variant="determinate" value={progress} />

          <Typography variant="BodySRegular" color="text.primary">
            {progressTitle}
          </Typography>
        </Stack>

        <Typography variant="BodySRegular" color="text.secondary">
          {subTitle}
        </Typography>
      </Stack>
    </Paper>
  );

  return hasLink && href ? (
    <Link href={href} sx={{ textDecoration: 'none' }}>
      {content}
    </Link>
  ) : (
    content
  );
};
