import { Stack, Box, Link } from '@mui/material';
import { LogoSquareIcon, LogoTextIcon } from '../Icons';

interface LogoProps {
  fullWidthOnMobile?: boolean;
  narrow?: boolean;
}

export const Logo = ({
  fullWidthOnMobile = false,
  narrow = false,
}: LogoProps) => (
  <Link
    href="/"
    sx={{
      display: { xs: 'flex', xl: 'inline' },
      justifyContent: { xs: 'center', xl: undefined },
    }}
  >
    <Stack
      direction="row"
      gap={narrow ? 1.4 : 2}
      padding={3}
      display="inline-flex"
    >
      <Box
        sx={{
          display: {
            xs: fullWidthOnMobile ? 'none' : 'block',
            sm: 'block',
          },
          fontSize: 0,
        }}
      >
        <LogoSquareIcon
          sx={{
            width: narrow ? '20.47px' : '28px',
            height: narrow ? '14.55px' : '20px',
          }}
        />
      </Box>
      <Box
        sx={{
          display: {
            xs: fullWidthOnMobile ? 'block' : 'none',
            md: fullWidthOnMobile ? 'block' : undefined,
            xl: !fullWidthOnMobile ? 'block' : undefined,
          },
          fontSize: 0,
        }}
      >
        <LogoTextIcon
          sx={{
            width: narrow ? '147.68px' : '202px',
            height: narrow ? '14.54px' : '20px',
          }}
        />
      </Box>
    </Stack>
  </Link>
);
